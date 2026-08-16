import { DraftStore } from "./draftstore"
import type {DataRecord, DomainKeyHelper, RecordState} from "./sharedtypes"
import { DataProviderBasis } from "./dataprovider"
import {PageMerger} from "./pagemerger";

export abstract class BufferedDataProvider extends DataProviderBasis {
    protected draftStore = new DraftStore()
    protected abstract deleteRecordsFromDb(uids: string[]): Promise<void>
    protected domainKeyHelper: DomainKeyHelper<unknown>

    public constructor(pageSize: number, cacheCapacity: number, domainKeyHelper: DomainKeyHelper<unknown>) {
        super(pageSize, cacheCapacity)
        this.domainKeyHelper = domainKeyHelper
    }

    public override recordCount(): number {
        return (this.getDbRecordCount() ?? 0) + this.draftStore.newCount
    }

    public relocateDrafts(): void {
        this.draftStore.unpinAll()
        this.pageCache.clear()
        this.pendingPages.clear()
        this.notifier?.({ countChanged: true })
    }

    public getTelemetry() {
        return {
            newDrafts: this.draftStore.newCount,
            modDrafts: this.draftStore.modifiedCount,
            ...super.getTelemetry()}
    }

    public logTelemetry() {
        super.logTelemetry()
        console.log(this.draftStore)
    }


    public getRecordState(uid: string | undefined): RecordState {
        if (!uid) return undefined

        if (this.draftStore.isNew(uid)) return "new"
        if (this.draftStore.isModification(uid)) return "draft"
        return undefined;
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
        if (this.activeRecordIndex !== recordIndex) {
            throw Error("record is not the active record")
        }

        const rawRecord = this.getRecord(recordIndex, true)
        if (!rawRecord) throw Error("Can't access target record for draft mutation")

        const uid = String(rawRecord.uid)
        const existingDraftRecord = this.draftStore.getRecord(uid)

        let updatedDraftRecord: DataRecord
        if (existingDraftRecord) {
            updatedDraftRecord = { ...existingDraftRecord, [fieldId]: value }
        } else {
            updatedDraftRecord = { ...rawRecord, [fieldId]: value }
        }
        this.draftStore.addModification(updatedDraftRecord, rawRecord, this.domainKeyHelper)
    }

    public override addRecord(record: DataRecord): void {
        this.draftStore.addNew(record)
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
        const bufferedDataProvider = this
        const dbBridge = {
            async getRecordsFromDb(from:number, count: number) {
                return await bufferedDataProvider.fetchRecordsFromDb.bind(bufferedDataProvider)(from, count)
            },
            getDbRecordCount() {
                return bufferedDataProvider.getDbRecordCount() ?? 0
            }

        }
        const pageMerger = new PageMerger(dbBridge, this.draftStore, this.domainKeyHelper, this.pageSize)
        const fetchPromise = (async () => {
            try {
                const dbRecordCount = this.getDbRecordCount()
                if (!dbRecordCount) {
                    this.pendingPages.delete(pageIndex)
                    return false
                }
                let page = await pageMerger.getPage(pageIndex)
                if (!page) return false
                this.pageCache.set(pageIndex, page)
                this.pendingPages.delete(pageIndex)
                if (notify) this.notifier?.({})
                return true

            } catch(e) {
                this.pendingPages.set(pageIndex, currentRetries + 1)
                console.error(`[DataProviderBasis] Fetch page ${pageIndex} failed:`, e)
                return false
            }
        })()

        this.pendingPages.set(pageIndex, fetchPromise)
        return fetchPromise
    }
}