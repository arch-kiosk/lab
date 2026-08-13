import { DomainKeyHelper, DataRecord as D} from "../src/sharedtypes"
import { DraftEntry, DraftStore } from "../src/draftstore"

export type DataRecord = D | { uid: string; data: string }
export type MergeWindowItem = {
  dbIndex: number
  key: string
  virtualIndex: number
  record: DataRecord
}

export class RecordStore {
  records?: DataRecord[]
  constructor(values: Array<string>) {
    this.records = values.map((v, index) => {
      return { uid: index.toString(), data: v }
    })
  }

  getRecordsFromDb(from: number, count: number): DataRecord[] {
    console.log(`fetching records ${from} to ${from + count - 1}`)
    return this.records?.slice(from, from + count) ?? []
  }
  getRecordCount() {
    return this.records?.length ?? 0
  }
}

export class SimpleDraftStore {
  draftStore = new DraftStore()
  /**
   * adds a new draft that modifies an existing db record
   * (unlike addNew, which creates a draft that represents a new, not yet existing db record)
   * @param record
   */
  public addModification(
    updatedRecord: DataRecord,
    rawDbRecord: DataRecord | undefined,
    domainKeyHelper: DomainKeyHelper<unknown>,
    pinIfNecessary = true,
  ): void {
    this.draftStore.addModification(updatedRecord, rawDbRecord, domainKeyHelper, pinIfNecessary)
  }

  public pinDraft(draft: DraftEntry, pinToKey: undefined) {
    this.draftStore.pinDraft(draft, pinToKey)
  }

  public getPosKey(
    draft: DraftEntry,
    domainKeyHelper: DomainKeyHelper<unknown>,
  ): unknown | undefined {
    return this.draftStore.getPosKey(draft, domainKeyHelper)
  }

  public getDraftCount() {
    return this.draftStore.count
  }

  public getDraft(uid: string): DraftEntry | undefined {
    return this.draftStore.getDraft(uid)
  }

  public sortDrafts(drafts: DraftEntry[], domainKeyHelper: DomainKeyHelper<unknown>) {
    return this.draftStore.sortDrafts(drafts, domainKeyHelper)
  }

  getAllDrafts(domainKeyHelper: DomainKeyHelper<unknown>, excludePinned = false) {
    let drafts = this.draftStore.getAllDrafts(excludePinned)
    this.sortDrafts(drafts, domainKeyHelper)
    return drafts
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
    for (const draft of this.draftStore.getDraftMap.values()) {
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

  public getRecord(uid: string) {
    return this.draftStore.getRecord(uid)
  }

  public get newCount() {
    return this.draftStore.newCount
  }

  public addNew(record: DataRecord): DraftEntry {
    return this.draftStore.addNew(record)
  }

  public unPinDraft(draft: DraftEntry) {
    this.draftStore.unPinDraft(draft)
  }


  public getDraftsInsertedBeforeRecord(
    record: DataRecord,
    domainKeyHelper: DomainKeyHelper<unknown>,
  ) {
    // console.log(this.draftStore.getAllDrafts())
    return this.draftStore
      .getAllDrafts(false, true)
      .filter(
        (draft) =>
          domainKeyHelper.compareKeys(
            this.draftStore.getPosKey(draft, domainKeyHelper),
            record.data,
          ) < 0,
      ) //draft.record.data
      .map((draft) => draft.record)
  }

  public getModifiedRecordsBeforeRecord(
    record: DataRecord,
    domainKeyHelper: DomainKeyHelper<unknown>,
  ) {
    return this.draftStore
      .getAllDrafts()
      .filter((draft) => {
        return (
          draft.originalDbKey && domainKeyHelper.compareKeys(draft.originalDbKey, record.data) < 0
        )
      })
      .map((draft) => draft.record)
  }

  unpinAll() {
    this.draftStore.unpinAll()
  }
}

export class PageMerger {
  db: RecordStore
  draftStore: SimpleDraftStore
  pageSize: number
  domainKeyHelper: DomainKeyHelper<unknown>

  insertAfter<T>(array: T[], index: number, ...newElements: T[]): T[] {
    if (index >= -1 && index <= array.length) {
      array.splice(index + 1, 0, ...newElements)
    }
    return array
  }

  insertBefore<T>(array: T[], index: number, ...newElements: T[]): T[] {
    if (index >= 0 && index <= array.length) {
      array.splice(index, 0, ...newElements)
    }
    return array
  }

  constructor(
    db: RecordStore,
    ds: SimpleDraftStore,
    domainKeyHelper: DomainKeyHelper<unknown>,
    pageSize = 5,
  ) {
    this.db = db
    this.draftStore = ds
    this.pageSize = pageSize
    this.domainKeyHelper = domainKeyHelper
  }

  get dbRecordCount() {
    return this.getDbRecordCount()
  }

  getDbRecordCount() {
    return this.db.getRecordCount()
  }

  getRecordCount() {
    return this.dbRecordCount + this.draftStore.newCount
  }

  getPage(pageIndex: number): DataRecord[] | undefined {
    // if (pageIndex * this.pageSize >= this.dbRecordCount) return []
    try {
      const toIndex = pageIndex * this.pageSize + this.pageSize - 1
      const pageSize =
        this.dbRecordCount - toIndex < 1 ? this.dbRecordCount % this.pageSize : this.pageSize
      console.log(`getPage ${pageIndex}`)
      let page = this.dbRecordCount?this.db.getRecordsFromDb(pageIndex * this.pageSize, pageSize):[]

      if (this.draftStore.getDraftCount() == 0) {
        return page
      }
      return this.getVirtualPage(pageIndex, page)
    } catch (e) {
      console.error(e)
    }
    return undefined
  }

  protected getVirtualPage(
    pageIndex: number,
    initialRecords: DataRecord[],
  ): DataRecord[] | undefined {
    const _getVirtualPage = (startIndex: number, endIndex: number, dbRecords: DataRecord[]) => {
      if (startIndex > this.dbRecordCount - 1) {
        //no db record in this page -> extend currentStart to last dbRecord
        startIndex = this.dbRecordCount - 1
        dbRecords = this.db.getRecordsFromDb(startIndex, endIndex)
      }
      let currentStart = startIndex
      let currentEnd = endIndex
      let startKey = dbRecords.length > 0 ? dbRecords[0].data : undefined
      let endKey = dbRecords.length > 0 ? dbRecords[dbRecords.length - 1].data : undefined
      const recordWindow = this.initRecordWindow(dbRecords, currentStart)
      const [moveNewStart, moveNewEnd] =
        dbRecords.length > 0 ? this.recalcWindowBoundaries(recordWindow) : [0, 0]
      let newStart = currentStart + moveNewStart
      let newEnd = currentEnd + moveNewEnd
      // let newEnd = currentEnd + this.moveRecordsBehindWindow(endKey, recordWindow)
      this.mergeDraftsIntoWindow(recordWindow, pageIndex)
      if (startKey !== undefined && endKey !== undefined) {
        this.moveRecordsBeforeWindow(startKey, recordWindow)
        this.moveRecordsBehindWindow(endKey, recordWindow)
      }
      this.removeShuffledRecords(recordWindow)
      this.assignVirtualIndexes(recordWindow)
      this.completeVirtualIndexes(recordWindow, pageIndex)
      if (this.pageComplete(recordWindow, pageIndex)) {
        return this.compilePage(recordWindow, pageIndex)
      } else {
        if (newStart < currentStart || newEnd > currentEnd) {
          // const dbRecords = this.db.getRecordsFromDb(newStart, newEnd +1 - newStart)
          // return _getVirtualPage(newStart, newEnd, dbRecords)
          let from = Math.max(0, newStart - 1)
          let c = Math.min(newEnd + 2 - newStart, this.dbRecordCount - from)
          const dbRecords = this.db.getRecordsFromDb(from, c)
          newStart = Math.max(0, newStart - 1)
          if (newStart == startIndex && newEnd === endIndex)
            throw "_getVirtualPage recursion with same boundaries prohibited."
          return _getVirtualPage(newStart, newEnd, dbRecords)
        } else {
          return undefined
        }
      }
    }

    const startIndex = pageIndex * this.pageSize
    if (startIndex > this.getRecordCount() - 1) return []

    const endIndex = Math.min(
      pageIndex * this.pageSize + this.pageSize - 1,
      this.getRecordCount() - 1,
    )
    if (this.dbRecordCount > 0) {
      return _getVirtualPage(startIndex, endIndex, initialRecords)
    }
    if (this.getRecordCount() > 0) {
      return this.compileDraftPage(pageIndex)
    }
    return []
  }

  public compileDraftPage(pageIndex: number): Array<DataRecord> {
    let drafts = this.draftStore.getAllDrafts(this.domainKeyHelper)
    let firstRecord = pageIndex * this.pageSize
    // if (firstRecord > drafts.length - 1) return []
    let page: Array<DataRecord> = []
    for (let idx = firstRecord; idx < Math.min(pageIndex * this.pageSize + this.pageSize, drafts.length); idx++) {
      page.push(drafts[idx].record)
    }
    return page
  }

  public initRecordWindow(dbRecords: DataRecord[], baseIndex: number) {
    const recordWindow: Array<MergeWindowItem> = []
    for (let idx = 0; idx < dbRecords.length; idx++) {
      recordWindow.push({
        dbIndex: baseIndex + idx,
        key: dbRecords[idx].data,
        virtualIndex: -1,
        record: dbRecords[idx],
      })
    }
    return recordWindow
  }

  public pageComplete(recordWindow: Array<MergeWindowItem>, pageIndex: number): boolean {
    let c = -1
    for (const record of recordWindow) {
      if (c == -1 && record.virtualIndex == pageIndex * this.pageSize) {
        c = record.virtualIndex
      } else {
        if (c > -1 && record.virtualIndex == c + 1) {
          c++
        } else if (c > -1) throw "Error in pageComplete: Illogical or ill-sorted index sequence"
      }
      if (
        c > -1 &&
        record.virtualIndex ==
          Math.min(pageIndex * this.pageSize + this.pageSize - 1, this.getRecordCount() - 1)
      ) {
        return true
      }
    }
    return false
  }

  public compilePage(
    recordWindow: Array<MergeWindowItem>,
    pageIndex: number,
  ): DataRecord[] | undefined {
    let c = -1
    let page: Array<DataRecord> = []

    for (const record of recordWindow) {
      if (c == -1 && record.virtualIndex == pageIndex * this.pageSize) {
        c = record.virtualIndex
        page.push(record.record)
      } else {
        if (c > -1 && record.virtualIndex == c + 1) {
          page.push(record.record)
          c++
          // if (record.virtualIndex == Math.min(pageIndex * this.pageSize + this.pageSize - 1,this.dbRecordCount-1)) {
          if (record.virtualIndex == pageIndex * this.pageSize + this.pageSize - 1) {
            return page
          }
        } else if (c > -1) throw "Error in pageComplete: Illogical or ill-sorted index sequence"
      }
    }
    return page
  }

  public mergeDraftsIntoWindow(recordWindow: Array<MergeWindowItem>, pageIndex: number) {
    let idx = 0
    const draftsInserted: string[] = []

    // all drafts that are before the first db row
    if (pageIndex == 0) {
      for (const draft of this.draftStore.getDraftsBetween(
        undefined,
        recordWindow.length > 0 ? recordWindow[idx].key : undefined,
        this.domainKeyHelper,
      )) {
        if (draft.isNew && draft.pinned && draft.pinnedKey === undefined) continue
        if (draftsInserted.find((uid) => uid === draft.record.uid) === undefined) {
          this.insertBefore(recordWindow, idx, {
            dbIndex: -1,
            key: this.draftStore.getPosKey(draft, this.domainKeyHelper), // this.domainKeyHelper.extractKey(draft.record.data),
            virtualIndex: -1,
            record: draft.record,
          })
          draftsInserted.push(draft.record.uid)
          idx++
        }
      }
    }

    //todo: I am not sure this is still a valid exit
    // if (this.dbRecordCount == 0) return

    const firstDbRow = idx
    let lastDbRow = recordWindow.length - 1

    // all drafts that are after the last db row
    if (pageIndex >= Math.trunc(this.dbRecordCount / this.pageSize)) {
      for (const draft of this.draftStore.getDraftsBetween(
        recordWindow[recordWindow.length - 1]?.key,
        undefined,
        this.domainKeyHelper,
      )) {
        if (draftsInserted.find((uid) => uid === draft.record.uid) === undefined) {
          this.insertAfter(recordWindow, recordWindow.length - 1, {
            dbIndex: -1,
            key: this.draftStore.getPosKey(draft, this.domainKeyHelper), // draft.record.data as string,
            virtualIndex: -1,
            record: draft.record,
          })
          draftsInserted.push(draft.record.uid)
          idx++
        }
      }
      idx++
    }

    //all drafts that are pinned to the end
    if (pageIndex >= Math.trunc(this.dbRecordCount / this.pageSize)) {
      for (const draft of this.draftStore.getAllDrafts(this.domainKeyHelper)) {
        if (draftsInserted.find((uid) => uid === draft.record.uid) === undefined) {
          if (draft.isNew && draft.pinned && draft.pinnedKey === undefined) {
            this.insertAfter(recordWindow, recordWindow.length - 1, {
              dbIndex: -1,
              key: this.draftStore.getPosKey(draft, this.domainKeyHelper), // draft.record.data as string,
              virtualIndex: -1,
              record: draft.record,
            })
            draftsInserted.push(draft.record.uid)
          }
        }
      }
    }


    // all drafts that are between the first and last row in the window
    idx = firstDbRow
    while (idx < lastDbRow) {
      for (const draft of this.draftStore.getDraftsBetween(
        recordWindow[idx].key,
        recordWindow[idx + 1].key,
        this.domainKeyHelper,
      )) {
        if (draft.isNew && draft.pinned && draft.pinnedKey === undefined) continue
        if (draftsInserted.find((uid) => uid === draft.record.uid) === undefined) {
          this.insertAfter(recordWindow, idx, {
            dbIndex: -1,
            key: this.draftStore.getPosKey(draft, this.domainKeyHelper), //draft.record.data as string,
            virtualIndex: -1,
            record: draft.record,
          })
          draftsInserted.push(draft.record.uid)
          idx++
          lastDbRow++
        }
      }
      idx++
    }
  }

  recalcWindowBoundaries(recordWindow: Array<MergeWindowItem>) {
    let topMovement: number = 0,
      bottomMovement: number = 0
    const keyTop = recordWindow[0].key
    const keyBottom = recordWindow[recordWindow.length - 1].key

    for (const draft of this.draftStore.getAllDrafts(this.domainKeyHelper, false)) {
      let origin = undefined
      if (draft.isNew && draft.pinned && draft.pinnedKey === undefined) continue
      // an origin is always calculated on the basis of the record in the database
      if (draft.originalDbKey !== undefined) {
        if (this.domainKeyHelper.compareKeys(draft.originalDbKey, keyTop) < 0) {
          origin = -1
        } else {
          if (this.domainKeyHelper.compareKeys(draft.originalDbKey, keyBottom) > 0) {
            origin = 1
          } else {
            origin = 0
          }
        }
      }

      // target of draft
      //targetKey is pinnedKey ?? record.key
      const targetKey = this.draftStore.getPosKey(draft, this.domainKeyHelper)
      if (this.domainKeyHelper.compareKeys(targetKey, keyTop) < 0) {
        //draft target is before keyTop
        if ((origin ?? 0) > -1) topMovement--
        if ((origin ?? 0) > 0) bottomMovement--
      } else {
        if (this.domainKeyHelper.compareKeys(targetKey, keyBottom) > 0) {
          //draft target is after keyBottom
          if (origin !== undefined && origin < 1) bottomMovement++
          if (origin !== undefined && origin < 0) topMovement++
        } else {
          // draft target is INto the page
          if (origin === undefined || origin > 0) bottomMovement--
          if (origin !== undefined && origin < 0) topMovement++
        }
      }
    }
    return [topMovement, bottomMovement]
  }

  public moveRecordsOutOfWindow(
    refKey: string,
    recordWindow: Array<MergeWindowItem>,
    direction: "before" | "behind",
  ) {
    let idx = 0
    let removedItems = 0
    const movedInDirection: (idx: number) => boolean =
      direction === "before" ? (a: number) => a < 0 : (a: number) => a > 0
    while (idx < recordWindow.length) {
      const item = recordWindow[idx]
      if (item.dbIndex > -1) {
        // const draft = this.draftStore.getRecord(item.record.uid)
        const draft = this.draftStore.getDraft(item.record.uid)
        if (draft) {
          // const draftKey = this.domainKeyHelper.extractKey(draft)
          const draftKey = this.draftStore.getPosKey(draft, this.domainKeyHelper)
          if (movedInDirection(this.domainKeyHelper.compareKeys(draftKey, refKey))) {
            recordWindow.splice(idx, 1)
            removedItems++
            continue
          }
        }
      }
      idx++
    }
    return removedItems
  }

  public moveRecordsBeforeWindow(startKey: string, recordWindow: Array<MergeWindowItem>) {
    return this.moveRecordsOutOfWindow(startKey, recordWindow, "before")
  }

  public moveRecordsBehindWindow(endKey: string, recordWindow: Array<MergeWindowItem>) {
    return this.moveRecordsOutOfWindow(endKey, recordWindow, "behind")
  }

  public removeShuffledRecords(recordWindow: Array<MergeWindowItem>) {
    let idx = 0
    while (idx < recordWindow.length) {
      const item = recordWindow[idx]
      if (item.dbIndex > -1) {
        if (this.draftStore.getDraft(item.record.uid)) {
          recordWindow.splice(idx, 1)
          continue
        }
      }
      idx++
    }
  }

  public completeVirtualIndexes(recordWindow: Array<MergeWindowItem>, pageIndex: number) {
    let succeedingIndex: number = -1
    let hasDbRow = false
    for (let idx = 0; idx < recordWindow.length; idx++) {
      if (recordWindow[idx].dbIndex > -1) hasDbRow = true
      if (recordWindow[idx].virtualIndex > -1) {
        if (succeedingIndex > -1 && !(succeedingIndex + 1 == recordWindow[idx].virtualIndex))
          throw Error("Found an illogical virtual Index. Stopping.")
        succeedingIndex = recordWindow[idx].virtualIndex
      } else {
        if (succeedingIndex > -1) {
          recordWindow[idx].virtualIndex = ++succeedingIndex
        }
      }
    }
    if (!hasDbRow) {
      // Only drafts, so we can simply number them starting with 0
      let idx = pageIndex * this.pageSize
      for (const record of recordWindow) {
        record.virtualIndex = idx++
      }
      return
    }
    let precedingIndex = -1
    for (let idx = recordWindow.length - 1; idx >= 0; idx--) {
      if (recordWindow[idx].virtualIndex > -1) {
        if (precedingIndex > -1 && !(precedingIndex - 1 == recordWindow[idx].virtualIndex))
          throw Error("Found an illogical virtual Index when going backwards. Stopping.")
        precedingIndex = recordWindow[idx].virtualIndex
      } else {
        if (precedingIndex > -1) {
          recordWindow[idx].virtualIndex = --precedingIndex
        }
      }
    }
  }

  public assignVirtualIndexes(recordWindow: Array<MergeWindowItem>) {
    for (let item of recordWindow) {
      if (item.virtualIndex == -1 && item.dbIndex > -1) {
        item.virtualIndex = this.getVirtualIndex(item.dbIndex, item.record)
      }
    }
  }

  public getVirtualIndex(baseIndex: number, record: DataRecord) {
    let draftsMovedInBefore = this.draftStore.getDraftsInsertedBeforeRecord(
      record,
      this.domainKeyHelper,
    ).length
    let recordsMovedOut = this.draftStore.getModifiedRecordsBeforeRecord(
      record,
      this.domainKeyHelper,
    ).length
    return baseIndex - recordsMovedOut + draftsMovedInBefore
  }
}
