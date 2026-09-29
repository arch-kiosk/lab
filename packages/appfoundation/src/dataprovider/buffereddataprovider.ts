import { DraftStore } from "./draftstore"
import type {
    DataRecord, DomainKeyHelper, RecordState,
    ValidationResultsReturnType, DataProviderValidationResults, DataProviderValidationStates,
    DataProviderValidationResult,
} from './sharedtypes'
import { DataProviderBasis } from "./dataprovider"
import { PageMerger } from "./pagemerger"

/** todo: this does not belong in this package. AppFoundation? */
export abstract class BufferedDataProvider extends DataProviderBasis {
    protected draftStore = new DraftStore()
    protected abstract deleteRecordsFromDb(uids: string[]): Promise<void>
    protected domainKeyHelper: DomainKeyHelper<unknown>
    protected useFallBackPageMerger = false
    protected validationStore: Map<number, DataProviderValidationResults> = new Map()

    protected constructor(
        pageSize: number,
        cacheCapacity: number,
        domainKeyHelper: DomainKeyHelper<unknown>,
    ) {
        super(pageSize, cacheCapacity)
        this.domainKeyHelper = domainKeyHelper
    }

    public override recordCount(): number {
        return (this.getDbRecordCount() ?? 0) + this.draftStore.newCount
    }

    public relocateDrafts(resetFallBackRenderer = false): void {
        if (resetFallBackRenderer) this.useFallBackPageMerger = false
        this.draftStore.unpinAll()
        this.pageCache.clear()
        this.pendingPages.clear()
        this.notifier?.({ countChanged: true })
    }

    public getTelemetry() {
        return {
            newDrafts: this.draftStore.newCount,
            modDrafts: this.draftStore.modifiedCount,
            ...super.getTelemetry(),
        }
    }

    public logTelemetry() {
        super.logTelemetry()
        console.log(this.draftStore)
    }

    public getRecord(
        index: number,
        bufferedOnly = false,
        notify?: (index: number) => void,
    ): DataRecord | undefined {
        const pageIndex = Math.floor(index / this.pageSize)
        const offset = index % this.pageSize

        if (this.pageCache.has(pageIndex)) {
            let r = this.pageCache.get(pageIndex)?.[offset]
            if (r) {
                const draft = this.draftStore.getDraft(r.uid)
                if (draft) {
                    r = {...draft.record}
                }
                else r = {...r}
            }
            return r
        }

        return super.getRecord(index, bufferedOnly, notify)
    }


    public getRecordState(uid: string | undefined): RecordState {
        if (!uid) return undefined

        if (this.draftStore.isNew(uid)) return "new"
        if (this.draftStore.isModification(uid)) return "draft"
        return undefined
    }

    public override setActiveRecord(index: number): void {
        const dbCount = (this.cachedDbRecordCount ?? 0) + this.draftStore.newCount

        if (index >= dbCount) {
            this.activeRecordIndex = index
            this.notifier?.({ currentRecord: index })
            return
        }

        super.setActiveRecord(index)
    }

    public override dataChanged(recordIndex: number, fieldId: string, value: unknown): void {
        const validationResult: DataProviderValidationResults = {
            result: 'unknown',
        }

        if (this.activeRecordIndex !== recordIndex) {
            throw Error("record is not the active record")
        }

        const rawRecord = this.getRecord(recordIndex, true)
        if (!rawRecord) throw Error("Can't access target record for draft mutation")

        const uid = String(rawRecord.uid)
        const existingDraftRecord = this.draftStore.getRecord(uid)

        const rc = this.runFieldValidation(recordIndex, fieldId, value)
        let newValue
        if (rc) {
            let fv
            [fv, newValue] = rc
            if (!validationResult.fields) validationResult.fields = {}
            validationResult.fields![fieldId] = fv
        }

        let updatedDraftRecord: DataRecord
        if (existingDraftRecord) {
            updatedDraftRecord = { ...existingDraftRecord, [fieldId]: newValue ?? value }
        } else {
            updatedDraftRecord = { ...rawRecord, [fieldId]: newValue ?? value }
        }

        const rv = this.runRecordValidation(recordIndex, updatedDraftRecord)
        if (rv) {
            if (rv[1] !== undefined) {
                updatedDraftRecord = rv[1]
            }
            validationResult.record = rv[0]
        }

        this.consolidateValidationResult(validationResult)
        this.draftStore.addModification(updatedDraftRecord, rawRecord, this.domainKeyHelper)
        this.validationStore.set(recordIndex, validationResult)

        console.log("BufferedDataProvider.dataChanged: ", updatedDraftRecord)
    }

    private consolidateValidationResult(validationResult: DataProviderValidationResults) {
        const priority: Record<DataProviderValidationStates, number> = {'unknown': 0, 'valid': 1, 'warning': 2, 'error': 3}
        validationResult.result = 'valid'
        if (validationResult.fields) {
            for (let fv of Object.values(validationResult.fields)) {
                for (let v of fv) {
                    if (priority[v.result] > priority[validationResult.result]) {
                        validationResult.result = v.result
                    }
                }
            }
        }
        if (validationResult.record) {
            for (let rv of Object.values(validationResult.record)) {
                if (priority[rv.result] > priority[validationResult.result]) {
                    validationResult.result = rv.result
                }
            }
        }
    }

    private runRecordValidation(recordIndex: number, updatedDraftRecord: DataRecord): ValidationResultsReturnType<DataRecord> | undefined {
        let rv: ValidationResultsReturnType<DataRecord> | undefined

        if (this.onValidateRecord) {
            rv = this.onValidateRecord(recordIndex, updatedDraftRecord)
        }
        console.log(`validating record ${recordIndex}:`, rv)
        return rv
    }

    private runFieldValidation(recordIndex: number, fieldId: string, value: unknown): ValidationResultsReturnType<typeof value> | undefined {
        let fv: ValidationResultsReturnType<typeof value> | undefined
        if (this.onValidateField) {
            fv = this.onValidateField(recordIndex, fieldId, value)
        }
        console.log(`validating field ${fieldId}:`, fv)

        return fv
    }

    /** This runs validation without changing either record nor field values.
     * It only creates the validationRecord in the validationStore and returns it
     *
     * @param recordIndex
     * @returns DataProviderValidationResults
     */
    protected validateRecord(recordIndex: number) {
        const record = this.getRecord(recordIndex, true)
        const validationResult: DataProviderValidationResults = {result: 'unknown'}
        console.log(`validating record ${recordIndex} again ...`)
        if (!record) throw new Error(`BufferedDataProvider.validateRecord can't find record ${recordIndex}`)
        for (const [fieldId, value] of Object.entries(record)) {
            const fv = this.runFieldValidation(recordIndex, fieldId, value)
            if (fv) {
                if (!validationResult.fields) validationResult.fields = {}
                validationResult.fields![fieldId] = fv[0]
            }
        }

        const rv = this.runRecordValidation(recordIndex, record)
        if (rv) {
            validationResult.record = rv[0]
        }

        this.consolidateValidationResult(validationResult)
        this.validationStore.set(recordIndex, validationResult)
        return validationResult
    }

    public getFieldValidationInformation(recordIndex: number, fieldId:string): Array<DataProviderValidationResult> {
        let vi = this.validationStore.get(recordIndex)
        if (!vi) {
            vi = this.validateRecord(recordIndex)
        }
        return vi?.fields?.[fieldId] ?? []
    }

    public getRecordValidationInformation(recordIndex: number): Array<DataProviderValidationResult> {
        let vi = this.validationStore.get(recordIndex)
        if (!vi) {
            vi = this.validateRecord(recordIndex)
        }
        return vi?.record ?? []
    }

    public override addRecord(record: DataRecord): void {
        this.draftStore.addNew(record)
        let lastPageIndex = Math.trunc(this.recordCount() / this.pageSize)
        console.log("deleting", this.pageCache.delete(lastPageIndex))
        this.notifier?.({ countChanged: true })
    }

    public async deleteRecords(uids: string[]): Promise<void> {
        if (!uids || uids.length === 0) return

        const uidSet = new Set(uids.map((id) => String(id)))

        let activeRecordWasDeleted = false
        if (this.activeRecordIndex !== undefined) {
            const activeRecord = this.getRecord(this.activeRecordIndex, true)
            if (activeRecord && uidSet.has(String(activeRecord.uid))) {
                activeRecordWasDeleted = true
                this.activeRecordIndex = undefined
                this.pendingActiveIndex = undefined
            }
        }

        const dbUids = uids.filter((uid) => !this.draftStore.isNew(String(uid)))
        this.draftStore.remove(uids)

        if (dbUids.length > 0 && this.cachedDbRecordCount !== undefined) {
            this.cachedDbRecordCount = Math.max(0, this.cachedDbRecordCount - dbUids.length)
        }

        if (dbUids.length > 0) {
            try {
                await this.deleteRecordsFromDb(dbUids)
            } catch (err) {
                this.cachedDbRecordCount = undefined
                throw err
            } finally {
                this.pageCache.clear()
                this.pendingPages.clear()
            }
        } else {
            this.pageCache.clear()
            this.pendingPages.clear()
        }

        this.notifier?.({
            countChanged: true,
            ...(activeRecordWasDeleted ? { currentRecord: undefined } : {}),
        })
    }

    protected async fetchPage(
        pageIndex: number,
        currentRetries: number,
        notify = true,
    ): Promise<boolean> {
        // oxlint-disable-next-line typescript/no-this-alias
        const bufferedDataProvider = this
        const dbBridge = {
            async getRecordsFromDb(from: number, count: number) {
                return await bufferedDataProvider.fetchRecordsFromDb.bind(bufferedDataProvider)(from, count)
            },
            getDbRecordCount() {
                return bufferedDataProvider.getDbRecordCount() ?? 0
            },
        }
        const pageMerger = new PageMerger(
            dbBridge,
            this.draftStore,
            this.domainKeyHelper,
            this.pageSize,
        )
        const fetchPromise = (async () => {
            try {
                const dbRecordCount = this.getDbRecordCount()
                if (!dbRecordCount) {
                    this.pendingPages.delete(pageIndex)
                    return false
                }
                let page: DataRecord[] | undefined
                try {
                    if (this.useFallBackPageMerger) {
                        page = await pageMerger.getFallbackPage(pageIndex)
                    } else {
                        page = await pageMerger.getPage(pageIndex)
                    }
                    if (!page) return false
                } catch (e) {
                    console.log("switching to fall back merger", e)
                    this.useFallBackPageMerger = true
                    this.relocateDrafts()
                    return false
                }
                this.pageCache.set(pageIndex, page)
                this.pendingPages.delete(pageIndex)
                if (notify) this.notifier?.({})
                return true
            } catch (e) {
                this.pendingPages.set(pageIndex, currentRetries + 1)
                console.error(`[DataProviderBasis] Fetch page ${pageIndex} failed:`, e)
                return false
            }
        })()

        this.pendingPages.set(pageIndex, fetchPromise)
        return fetchPromise
    }
}
