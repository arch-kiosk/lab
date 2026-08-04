// oxlint-disable typescript/no-explicit-any typescript/no-redundant-type-constituents
import {DataRecord, DomainKeyHelper} from "./sharedtypes"

export type DraftEntry = {
    pinnedDbKey?: unknown
    record: DataRecord
    isNew: boolean
}

export class DraftStore {
    #drafts = new Map<string, DraftEntry>()
    #newUids: string[] = [] // Preserves New order

    public getRecord(uid: string, domainKeyHelper?: DomainKeyHelper<unknown>): DataRecord | undefined {
        const draft = this.#drafts.get(uid)
        if (draft && domainKeyHelper && draft.pinnedDbKey === undefined) {
            draft.pinnedDbKey = domainKeyHelper.extractKey(draft.record)
        }
        return draft?.record
    }

    public getNewAt(offset: number, domainKeyHelper?: DomainKeyHelper<unknown>): DataRecord | undefined {
        const uid = this.#newUids[offset]
        return this.getRecord(uid, domainKeyHelper)
        // return uid ? this.#drafts.get(uid)?.record : undefined
    }

    public isNew(uid: string): boolean {
        return this.#drafts.get(uid)?.isNew ?? false
    }

    public isModification(uid: string): boolean {
        return !(this.#drafts.get(uid)?.isNew ?? false)
    }

    public addNew(record: DataRecord): void {
        this.#drafts.set(record.uid, { record, isNew: true })
        this.#newUids.push(record.uid)
    }

    /**
     * adds a new draft that modifies an existing db record
     * (unlike addNew, which creates a draft that represents a new, not yet existing db record)
     * @param record
     */
    public addModification(record: DataRecord, domainKeyHelper?: DomainKeyHelper<unknown>): void {
        const draft: DraftEntry = { record, isNew: false }
        if (domainKeyHelper) {
            draft.pinnedDbKey = domainKeyHelper.extractKey(draft.record)
        }
        this.#drafts.set(record.uid, draft)
    }

    public updateDraft(record: DataRecord): void {
        const existing = this.#drafts.get(record.uid)
        if (existing) {
            existing.record = record
        }
    }


    public get newCount(): number {
        return this.#newUids.length
    }

    // Direct mapping to future persistence (e.g., JSON.stringify or IDB export)
    public getAllDrafts(): DraftEntry[] {
        return Array.from(this.#drafts.values())
    }

    /**
     * removes drafts with a certain uid.
     * UIDs that don't exist in the first place are silently ignored.
     * @param uids
     */
    public remove(uids: string[] = []): void {
        if (uids.length === 0) return

        const delSet = new Set(uids)
        for (const delUid of uids) {
            this.#drafts.delete(delUid)
        }
        this.#newUids = this.#newUids.filter((uid) => !delSet.has(uid))
    }}
