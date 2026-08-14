// oxlint-disable typescript/no-explicit-any typescript/no-redundant-type-constituents
import { DataRecord, DomainKeyHelper } from "./sharedtypes"

export interface DraftEntry {
  record: DataRecord
  isNew: boolean
  pinned: boolean
  pinnedKey?: string //originalDbKey if changed existing db Record within session, record.key if already sorted in
  originalDbKey?: unknown
}

export class DraftStore {
  #drafts = new Map<string, DraftEntry>()
  #newUids: string[] = [] // Preserves New order

  /**
   * returns the war draft map. For testing only
   * @returns draft map
   */
  public get getDraftMap() {
    return this.#drafts
  }

  /**
   * returns the index of a new draft in the creation order of new drafts
   * @param draftEntry
   * @returns -1 if draft not found in the creation order. Otherwise position starting with 0
   */
  public newIndex(draftEntry: DraftEntry) {
    return this.#newUids.findIndex((uid) => uid === draftEntry.record.uid)
  }

  /**
   * sorts the drafts given by parameter in place using the domainKeyHelper
   * @param drafts
   * @param domainKeyHelper
   */
  public sortDrafts(drafts: DraftEntry[], domainKeyHelper: DomainKeyHelper<unknown>) {
    drafts.sort((a, b) => {
      const newIndexA = this.newIndex(a)
      const newIndexB = this.newIndex(b)
      if (newIndexA == -1 && newIndexB >= 0) return -1
      if (newIndexA >= 0 && newIndexB == -1) return 1
      if (newIndexA > -1 && newIndexB > -1) return Math.sign(newIndexA - newIndexB)
      return domainKeyHelper.compareKeys(
            domainKeyHelper.extractKey(a.record),
            domainKeyHelper.extractKey(b.record),
      )
    })
  }

  /**
   * Not returning drafts that are new and pinned to the end
   * @param key1 - can be undefined
   * @param key2 - can be undefined
   * @param domainKeyHelper
   * @returns list of drafts between the two keys
   */
  public getDraftsBetween(
      key1: string | undefined,
      key2: string | undefined,
      domainKeyHelper: DomainKeyHelper<unknown>,
  ) {
    const result = []
    for (const draft of this.#drafts.values()) {
      const draftKey = this.getPosKey(draft, domainKeyHelper) //.extractKey(draft.record)

      //a new draft that is pinned to the end
      if (draftKey === undefined) continue

      if (
          (!key1 || domainKeyHelper.compareKeys(key1, draftKey) <= 0) &&
          (!key2 || domainKeyHelper.compareKeys(draftKey, key2) <= 0)
      ) {
        result.push(draft)
      }
    }
    this.sortDrafts(result, domainKeyHelper)
    return result
  }


  /**
   * returns the drafts that should appear before the given record's key
   * @param record
   * @param domainKeyHelper
   * @returns Array of all DraftRecord, can be empty
   */
  public getDraftsInsertedBeforeRecord(
      record: DataRecord,
      domainKeyHelper: DomainKeyHelper<unknown>,
  ) {
    // console.log(this.draftStore.getAllDrafts())
    return this
        .getAllDrafts(domainKeyHelper, false, true)
        .filter(
            (draft: DraftEntry) =>
                domainKeyHelper.compareKeys(
                    this.getPosKey(draft, domainKeyHelper),
                    record.data,
                ) < 0,
        ) //draft.record.data
        .map((draft: DraftEntry) => draft.record)
  }

  /**
   * returns the record component of all drafts that are tied to a database record
   * that should appear before the given record in the sort order
   * @param record
   * @param domainKeyHelper
   * @returns array of DataRecord or an empty array
   */
  public getModifiedRecordsBeforeRecord(
      record: DataRecord,
      domainKeyHelper: DomainKeyHelper<unknown>,
  ) {
    return this
        .getAllDrafts(domainKeyHelper)
        .filter((draft) => {
          return (
              draft.originalDbKey && domainKeyHelper.compareKeys(draft.originalDbKey, record.data) < 0
          )
        })
        .map((draft) => draft.record)
  }

  /**
   * returns the record component of a draft
   * @param uid
   * @returns DataRecord or undefined if the uid is unknown
   */
  public getRecord(uid: string): DataRecord | undefined {
    const draft = this.#drafts.get(uid)
    return draft?.record
  }

  /**
   * returns a draft by uid
   * @param uid
   * @returns a DraftEntry or undefined if the uid is unknown
   */
  public getDraft(uid: string): DraftEntry | undefined {
    return this.#drafts.get(uid)
  }

  /**
   * returns the pinned key or the current key of the record
   * @param draft
   * @param domainKeyHelper
   * @returns the key
   */
  public getPosKey(draft: DraftEntry, domainKeyHelper: DomainKeyHelper<unknown>): unknown | undefined {
    return draft.pinnedKey ?? domainKeyHelper.extractKey(draft.record)
  }

  /**
   * returns the number of all drafts
   * @returns
   */
  public get count() {
    return this.#drafts.size
  }

  /**
   * alias for .count
   * @returns
   */
  public getDraftCount() {
    return this.count
  }

  // public getNewAt(offset: number, domainKeyHelper?: DomainKeyHelper<unknown>): DataRecord | undefined {
  //     const uid = this.#newUids[offset]
  //     return this.getRecord(uid, domainKeyHelper)
  //     // return uid ? this.#drafts.get(uid)?.record : undefined
  // }

  public isNew(uid: string): boolean {
    return this.#drafts.get(uid)?.isNew ?? false
  }

  public isModification(uid: string): boolean {
    const draft = this.#drafts.get(uid)
    return !(!draft || draft?.isNew)
  }

  /**
   * adds a new draft representing a new record that is not in the database
   * the draft gets pinned and its order of creation among other new records saved
   * @param record -  DataRecord component of the draft
   * @returns the new draft
   */
  public addNew(record: DataRecord): DraftEntry {
    const draft = { record, isNew: true, pinned: true, pinnedKey: undefined }
    this.#drafts.set(record.uid, draft)
    this.#newUids.push(record.uid)
    return draft
  }

  /**
   * adds a new draft that modifies an existing db record
   * (unlike addNew, which creates a draft that represents a new, not yet existing db record)
   * If there is already a draft for that uid the method throws an error
   * @param updatedRecord - The modified record
   * @param rawDbRecord - The original record as stored in the db
   * @param domainKeyHelper
   */
  public addModification(
    updatedRecord: DataRecord,
    rawDbRecord: DataRecord | undefined,
    domainKeyHelper: DomainKeyHelper<unknown>,
    pinIfNecessary=true
  ): void {
    const uid = String(updatedRecord.uid)
    if (!this.#drafts.has(uid)) {
      if (!rawDbRecord) throw("DraftStore.addModification: Can't modify a record without knowing the original db record")

      const originalDbKey = domainKeyHelper ? domainKeyHelper.extractKey(rawDbRecord) : undefined
      const newDraft = {
        record: updatedRecord,
        isNew: false,
        // pinnedDbKey: undefined,
        pinned: false,
        originalDbKey: originalDbKey,
      }
      this.#drafts.set(uid, newDraft)
      if (pinIfNecessary) this.pinDraft(newDraft, originalDbKey)
    } else {
      this.updateDraft(updatedRecord, domainKeyHelper, pinIfNecessary)
    }
  }

  // public getUnpinnedModifications(): Array<{ uid: string; originalDbKey: unknown }> {
  //     const result: Array<{ uid: string; originalDbKey: unknown }> = []
  //     for (const entry of this.#drafts.values()) {
  //         if (!entry.isNew && entry.pinnedDbKey === undefined && entry.originalDbKey !== undefined) {
  //             result.push({ uid: String(entry.record.uid), originalDbKey: entry.originalDbKey })
  //         }
  //     }
  //     return result
  // }

  public updateDraft(record: DataRecord, domainKeyHelper: DomainKeyHelper<unknown>, pinIfNecessary=true): void {
    const existing = this.#drafts.get(record.uid)
    if (existing) {
      if (!existing.pinned && pinIfNecessary) {
        //this case should not occur under normal circumstances: A user can only modify an existing
        //draft if the draft appeared on a page, which should make it a pinned draft.
        this.pinDraft(existing, domainKeyHelper.extractKey(existing.record))
      }
      existing.record = record
    }
  }

  /** returns the number of drafts that are not tied to a record in the database
   *
   * @returns number of drafts marked with isNew
   */
  public get newCount(): number {
    return this.#drafts
      .values()
      .filter((draft) => draft.isNew)
      .toArray().length
  }

  /** returns the number of drafts that are tied to a record in the database
   *
   * @returns number of drafts tied to record in database
   */
  public get modifiedCount(): number {
    return this.#drafts
      .values()
      .filter((d) => !d.isNew)
      .toArray().length
  }

  /**
   * returns all raw draft records freshly sorted
   * excludePinned: excludes drafts that are pinned from the list
   * excludeNewPinned: excludes drafts that are entirely new (drafts that must appear at the end of the list)
   * todo: refactor - excludePinned is not required and excludeNewPinned is so weird that it might be better
   *        to filter these out by the caller
   * @returns drafts
   */
  public getAllDrafts(domainKeyHelper: DomainKeyHelper<unknown>,
                      excludePinned = false,
                      excludeNewPinned = false): DraftEntry[] {
    let drafts: DraftEntry[]
    if (excludePinned) {
      drafts= Array.from(this.#drafts.values()).filter((draft) => !draft.pinned)
    } else if (excludeNewPinned) {
      drafts= Array.from(this.#drafts.values()).filter((draft) => !(draft.isNew && draft.pinned && draft.pinnedKey === undefined))
      } else drafts= Array.from(this.#drafts.values())

    this.sortDrafts(drafts, domainKeyHelper)
    return drafts
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
  }

  /**
   * unpins all records and destroys the creation order of new records
   */
  public unpinAll(): void {
    this.#newUids = []
    for (const entry of this.#drafts.values()) {
      entry.pinnedKey = undefined
      entry.pinned = false
    }
  }

  // public getUnpinnedDrafts(): DataRecord[] {
  //     const unpinned: DataRecord[] = []
  //     for (const entry of this.#drafts.values()) {
  //         if (entry.pinnedDbKey === undefined) {
  //             unpinned.push(entry.record)
  //         }
  //     }
  //     return unpinned
  // }

  // public pinDraft(uid: string, key: unknown): void {
  //     const entry = this.#drafts.get(uid)
  //     if (entry && entry.pinnedDbKey === undefined) {
  //         entry.pinnedDbKey = key
  //     }
  // }

  /** pins the draft to a key
   *  does not check if the draft is already pinned!
   * @param draft
   * @param pinToKey
   */
  public pinDraft(draft: DraftEntry, pinToKey: any) {
    draft.pinned = true
    draft.pinnedKey = pinToKey
  }

  /**
   * unpins a draft so that it gets sorted in by its keys
   * @param draft
   */
  public unPinDraft(draft: DraftEntry) {
    draft.pinned = false
    draft.pinnedKey = undefined
    this.#newUids = this.#newUids.filter((uid) => uid !== draft.record.uid)
  }
}
