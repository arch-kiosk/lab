// oxlint-disable typescript/no-redundant-type-constituents
import { DataRecord, DomainKeyHelper } from "./sharedtypes"

export interface DraftEntry {
  record: DataRecord
  isNew: boolean
  pinned: boolean
  pinnedKey?: unknown //originalDbKey if changed existing db Record within session, record.key if already sorted in
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
   * @returns -1 if draft not found in the creation order, otherwise position starting with 0
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
    key1: unknown | undefined,
    key2: unknown | undefined,
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
    return this.getAllDraftsExceptNewPinned() //(domainKeyHelper, true)
      .filter(
        (draft: DraftEntry) =>
          domainKeyHelper.compareKeys(
            this.getPosKey(draft, domainKeyHelper),
            domainKeyHelper.extractKey(record),
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
    return this.getAllDrafts(domainKeyHelper)
      .filter((draft) => {
        return (
          draft.originalDbKey &&
          domainKeyHelper.compareKeys(draft.originalDbKey, domainKeyHelper.extractKey(record)) < 0
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
  public getPosKey(
    draft: DraftEntry,
    domainKeyHelper: DomainKeyHelper<unknown>,
  ): unknown | undefined {
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

  /**
   * checks if there is a new draft for the given uid
   * @param uid
   * @returns true if there is one, false if there isn't or the draft isn't new
   */
  public isNew(uid: string): boolean {
    return this.#drafts.get(uid)?.isNew ?? false
  }

  /**
   * checks if there is a modified draft for the given uid
   * @param uid
   * @returns true if there is one, false if there isn't or the draft is a new draft
   */
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
   * (unlike addNew, which creates a draft that represents a new, not yet existing db record).
   * If there is already a draft for that uid the method throws an error
   * @param updatedRecord - The modified record
   * @param rawDbRecord - The original record as stored in the db
   * @param domainKeyHelper
   */
  public addModification(
    updatedRecord: DataRecord,
    rawDbRecord: DataRecord | undefined,
    domainKeyHelper: DomainKeyHelper<unknown>,
    pinIfNecessary = true,
  ): void {
    console.log(`DraftStore.addModification`, updatedRecord)
    const uid = String(updatedRecord.uid)
    let draft = this.#drafts.get(uid)
    if (draft) {
      if (pinIfNecessary) {
        this.pinDraft(draft, domainKeyHelper.extractKey(draft.record))
      }
      draft.record = updatedRecord
    } else {
      if (!rawDbRecord) {
        throw "DraftStore.addModification: Can't modify a record without knowing the original db record"
      }

      const originalDbKey = domainKeyHelper ? domainKeyHelper.extractKey(rawDbRecord) : undefined
      const newDraft = {
        record: updatedRecord,
        isNew: false,
        // pinnedDbKey: undefined,
        pinned: false,
        originalDbKey: originalDbKey,
      }
      this.#drafts.set(uid, newDraft)
      if (pinIfNecessary) {
        this.pinDraft(newDraft, originalDbKey)
      }
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
   * @returns number of drafts tied to a record in database
   */
  public get modifiedCount(): number {
    return this.#drafts
      .values()
      .filter((d) => !d.isNew)
      .toArray().length
  }

  /**
   * returns all raw draft records freshly sorted
   * @domainKeyHelper - the usual domain key helper
   * @returns ordered drafts
   */
  public getAllDrafts(domainKeyHelper: DomainKeyHelper<unknown>): DraftEntry[] {
    let drafts: DraftEntry[]
    drafts = Array.from(this.#drafts.values())

    this.sortDrafts(drafts, domainKeyHelper)
    return drafts
  }

  /**
   * returns draft records that are not new and pinned to undefined
   * (the drafts that should appear according to creation order at the end)
   * @returns unordered drafts
   */
  public getAllDraftsExceptNewPinned(): DraftEntry[] {
    let drafts: DraftEntry[]
    drafts = Array.from(this.#drafts.values()).filter(
      (draft) => !(draft.isNew && draft.pinned && draft.pinnedKey === undefined),
    )

    // this.sortDrafts(drafts, domainKeyHelper)
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

  /** pins the draft to a key
   *  does not check if the draft is already pinned!
   * @param draft
   * @param pinToKey
   */
  public pinDraft(draft: DraftEntry, pinToKey: unknown) {
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
