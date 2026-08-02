// oxlint-disable typescript/no-explicit-any typescript/no-redundant-type-constituents
import { DataNotifier, DataProvider } from "./dataprovider"
import { DataRecord } from "./sharedtypes"
import { DraftStore } from "./draftstore"

export class DraftDataProviderDecorator implements DataProvider {
    private innerProvider: DataProvider
    private draftStore = new DraftStore()
    private notifier?: DataNotifier
    private cachedDbCount: number = 0

    constructor(innerProvider: DataProvider) {
        this.innerProvider = innerProvider
    }

    /**
     * Called by the UI/Grid when layout count is needed.
     * Updates internal DB count and returns total (DB + creations).
     */
    public recordCount(): number {
        this.cachedDbCount = this.innerProvider.recordCount()
        return this.cachedDbCount + this.draftStore.newCount
    }
    public setNotifier(notifier: DataNotifier): void {
        this.notifier = notifier
        this.innerProvider.setNotifier?.(notifier)
    }

    public getRecord(
        index: number,
        bufferedOnly = false,
        notify?: (index: number) => void
    ): DataRecord | undefined {
        const dbRecordCount = this.cachedDbCount

        // Index falls beyond database bounds -> Fetch creation draft
        if (index >= dbRecordCount) {
            const creationOffset = index - dbRecordCount
            return this.draftStore.getNewAt(creationOffset)
        }

        const rawRecord = this.innerProvider.getRecord(index, bufferedOnly, notify)
        return this.applyDraftOverlay(rawRecord)
    }

    public setActiveRecord(index: number): void {
        const dbRecordCount = this.cachedDbCount

        // Handle active state directly for creation drafts
        if (index >= dbRecordCount) {
            this.notifier?.({ currentRecord: index })
            return
        }
        this.innerProvider.setActiveRecord(index)
    }


    public dataChanged(recordIndex: number, fieldId: string, value: unknown): void {
        const rawRecord = this.getRecord(recordIndex, true)
        if (!rawRecord) throw Error("Can't access target record for draft mutation")

        const uid = rawRecord.uid
        const existingDraft = this.draftStore.getRecord(uid)

        const draftToUpdate: DataRecord = existingDraft
            ? { ...existingDraft }
            : { ...rawRecord }

        draftToUpdate[fieldId] = value
        if (this.draftStore.isNew(uid)) {
            this.draftStore.updateDraft(draftToUpdate)
        } else {
            this.draftStore.setModification(draftToUpdate)
        }
    }

    /**
     * Appends a new creation draft and triggers the notifier
     * so the UI Virtual Scroll Container expands its scroll height.
     */
    public addRecord(record: DataRecord): void {
        this.draftStore.addNew(record)
        console.log(`Added ${record.uid}`)
        this.notifier?.({countChanged: true})
    }

    public getTelemetry() {
        return this.innerProvider.getTelemetry?.() ?? {cached: 0, capacity: 0}
    }

    private applyDraftOverlay(rawRecord: DataRecord | undefined): DataRecord | undefined {
        if (!rawRecord?.uid) return rawRecord
        const draft = this.draftStore.getRecord(rawRecord.uid)
        if (draft) {
            console.log(`Using draft for ${draft.uid}`)
        }
        return draft ?? rawRecord
    }
}