// oxlint-disable typescript/no-explicit-any typescript/no-redundant-type-constituents
import { DataRecord } from "./sharedtypes"

export type DraftEntry = {
    record: DataRecord
    isNew: boolean
}

export class DraftStore {
    #drafts = new Map<string, DraftEntry>()
    #newUids: string[] = [] // Preserves New order

    public getRecord(uid: string): DataRecord | undefined {
        return this.#drafts.get(uid)?.record
    }

    public isNew(uid: string): boolean {
        return this.#drafts.get(uid)?.isNew ?? false
    }

    public setModification(record: DataRecord): void {
        this.#drafts.set(record.uid, { record, isNew: false })
    }

    public addNew(record: DataRecord): void {
        this.#drafts.set(record.uid, { record, isNew: true })
        this.#newUids.push(record.uid)
    }

    public updateDraft(record: DataRecord): void {
        const existing = this.#drafts.get(record.uid)
        if (existing) {
            existing.record = record
        }
    }

    public getNewAt(offset: number): DataRecord | undefined {
        const uid = this.#newUids[offset]
        return uid ? this.#drafts.get(uid)?.record : undefined
    }

    public get newCount(): number {
        return this.#newUids.length
    }

    // Direct mapping to future persistence (e.g., JSON.stringify or IDB export)
    public getAllDrafts(): DraftEntry[] {
        return Array.from(this.#drafts.values())
    }
}