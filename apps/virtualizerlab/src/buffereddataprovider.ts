import { DraftStore } from "./draftstore"
import type { DataRecord } from "./sharedtypes"
import {DataProviderBasis} from "./dataprovider"


/**
 * Subclass integrating DraftStore for creation drafts and overlay modifications.
 */
export abstract class BufferedDataProvider extends DataProviderBasis {
    protected draftStore = new DraftStore()
    protected abstract deleteRecordsFromDb(uids: string[]) : Promise<void>

    public override recordCount(): number {
        return (this.getDbRecordCount() ?? 0) + this.draftStore.newCount
    }

    public override getRecord(
        index: number,
        bufferedOnly = false,
        notify?: (index: number) => void,
    ): DataRecord | undefined {
        // Intentional direct check: falls back to 0 while DB count is uninitialized/loading
        const dbCount = this.cachedDbRecordCount ?? 0

        if (index >= dbCount) {
            const creationOffset = index - dbCount
            return this.draftStore.getNewAt(creationOffset)
        }

        const rawRecord = super.getRecord(index, bufferedOnly, notify)
        return this.applyDraftOverlay(rawRecord)
    }

    public override setActiveRecord(index: number): void {
        const dbCount = this.cachedDbRecordCount ?? 0

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

    public override addRecord(record: DataRecord): void {
        this.draftStore.addNew(record)
        console.log(`Added ${record.uid}`)
        this.notifier?.({ countChanged: true })
    }

    public async deleteRecords(uids: string[]): Promise<void> {
        if (!uids || uids.length === 0) return

        const uidSet = new Set(uids)

        let activeRecordWasDeleted = false
        if (this.activeRecordIndex !== undefined) {
            const activeRecord = this.getRecord(this.activeRecordIndex, true)
            if (activeRecord && uidSet.has(activeRecord.uid)) {
                activeRecordWasDeleted = true
                this.activeRecordIndex = undefined
                this.pendingActiveIndex = undefined
            }
        }

        // 2. NOW purge drafts and partition DB UIDs
        const dbUids = uids.filter(uid => !this.draftStore.isNew(uid))
        this.draftStore.remove(uids)

        // 3. Update count cached in memory
        if (dbUids.length > 0 && this.cachedDbRecordCount !== undefined) {
            this.cachedDbRecordCount = Math.max(0, this.cachedDbRecordCount - dbUids.length)
        }

        // 4. Execute DB delete and clean caches
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
        }

        // 5. ATOMIC NOTIFICATION: Single event handles count and active record changes
        this.notifier?.({
            countChanged: true,
            ...(activeRecordWasDeleted ? { currentRecord: undefined } : {}),
        })
    }

    protected applyDraftOverlay(rawRecord: DataRecord | undefined): DataRecord | undefined {
        if (!rawRecord?.uid) return rawRecord
        const draft = this.draftStore.getRecord(rawRecord.uid)
        if (draft) {
            console.log(`Using draft for ${draft.uid}`)
        }
        return draft ?? rawRecord
    }
// Was once used to protect the pages that are currently in the viewport from eviction
    // I abandoned that but keep it here for reference.
    // private isPageProtected = (pageIndex: number): boolean => {
    //   for (const rowIndex of this.protectedRows) {
    //     if (Math.floor(rowIndex / this.pageSize) === pageIndex) {
    //       return true
    //     }
    //   }
    //   return false
    // }
}

