import delay from "delay"
import { DraftStore } from "./draftstore"
import { DataRecord } from "./sharedtypes"

import { LruPageCache, PageCache } from "./cache"

const MAX_RECORDS = 1000

export type DataNotification = {
  currentRecord?: number
  countChanged?: boolean
}

export type DataNotifier = (notification?: DataNotification) => void

export interface DataProvider {
  recordCount(): number | undefined
  getRecord(
      index: number,
      bufferedOnly?: boolean,
      notify?: (index: number) => void,
  ): DataRecord | undefined
  setActiveRecord(index: number): void
  setNotifier(notifier: DataNotifier): void
  dataChanged(recordIndex: number, fieldId: string, value: unknown): void
  addRecord(record: DataRecord): void
  deleteRecords(uids: string[]) : Promise<void>
  getTelemetry?(): { cached: number; capacity: number }
}

export abstract class DataProviderBasis implements DataProvider {
  protected pageSize: number
  protected pageCache: PageCache<DataRecord>
  protected pendingPages = new Map<number, Promise<boolean> | number>()
  protected maxRetries = 3

  protected activeRecordIndex?: number
  protected pendingActiveIndex?: number

  protected notifier?: DataNotifier

  protected cachedDbRecordCount?: number

  protected abstract recalcDbRecordCount(): Promise<boolean>

  public abstract fetch(fromRecord: number, toRecord: number): Promise<DataRecord[]>

  abstract recordCount(): number
  abstract addRecord(record: DataRecord): void
  abstract deleteRecords(uids: string[]): Promise<void>

  public constructor(pageSize = 50, cacheCapacity = 10) {
    this.pageSize = pageSize
    this.pageCache = new LruPageCache(cacheCapacity)
  }

  public getDbRecordCount(): number | undefined {
    if (this.cachedDbRecordCount === undefined) void this.recalcDbRecordCount()
    return this.cachedDbRecordCount
  }

  public setNotifier(notifier: DataNotifier): void {
    this.notifier = notifier
  }

  /**
   * Finds the global numeric index of a record by UID if cached.
   */
  public findIndexByUid(uid: string): number | undefined {
    const match = this.pageCache.findPageAndOffset((page) =>
        page.findIndex((record) => record?.uid === uid),
    )

    if (!match) return undefined
    return match.pageIndex * this.pageSize + match.offset
  }

  /**
   * Retrieves a record directly by its UID if currently cached.
   */
  public getRecordByUid(uid: string): DataRecord | undefined {
    const index = this.findIndexByUid(uid)
    return index !== undefined ? this.getRecord(index, true) : undefined
  }

  public setActiveRecordByUID(uid: string) {
    const index = this.findIndexByUid(uid)
    if (index !== undefined) {
      this.setActiveRecord(index)
    } else {
      throw Error(`No record with uid ${uid}.`)
    }
  }

  public dataChanged(recordIndex: number, fieldId: string, value: unknown) {
    if (this.activeRecordIndex != recordIndex) throw Error("record is not the active record")
    const record = this.getRecord(this.activeRecordIndex, true)
    if (record) {
      record[fieldId] = value
    } else throw Error("Can't access active Record")
  }

  public setActiveRecord(index: number) {
    this.pendingActiveIndex = index

    const r = this.getRecord(index, false, (loadedIndex: number) => {
      if (this.pendingActiveIndex === loadedIndex) {
        console.log(`switched record from ${this.activeRecordIndex} to ${index}`)
        this.activeRecordIndex = loadedIndex
        this.notifier?.({ currentRecord: loadedIndex })
      }
    })

    if (r) {
      console.log(`switched record from ${this.activeRecordIndex} to ${index}`)
      this.activeRecordIndex = index
      this.notifier?.({ currentRecord: index })
    }
  }

  public getRecord(
      index: number,
      bufferedOnly = false,
      notify?: (index: number) => void,
  ): DataRecord | undefined {
    const pageIndex = Math.floor(index / this.pageSize)
    const offset = index % this.pageSize

    if (this.pageCache.has(pageIndex)) {
      return this.pageCache.get(pageIndex)?.[offset]
    }

    if (!bufferedOnly) {
      if (notify) {
        void this.ensurePage(pageIndex, false).then((_) => {
          notify(index)
        })
      } else {
        void this.ensurePage(pageIndex)
      }
    }

    return undefined
  }

  private ensurePage(pageIndex: number, notifyAfterFetch = true): Promise<boolean> {
    if (this.pageCache.has(pageIndex)) {
      return Promise.resolve(true)
    }

    const status = this.pendingPages.get(pageIndex)
    if (status instanceof Promise) {
      return status
    }

    const retryCount = typeof status === "number" ? status : 0

    if (retryCount < this.maxRetries) {
      return this.fetchPage(pageIndex, retryCount, notifyAfterFetch)
    }

    return Promise.resolve(false)
  }

  public getTelemetry() {
    return {
      cached: this.pageCache.size,
      capacity: this.pageCache.capacity,
    }
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

  private async fetchPage(
      pageIndex: number,
      currentRetries: number,
      notify = true,
  ): Promise<boolean> {
    const fetchPromise = (async () => {
      try {
        const recordCount = this.getDbRecordCount()
        if (recordCount === undefined) return false
        const from = pageIndex * this.pageSize
        const to = Math.min(from + this.pageSize, recordCount)
        const fetched = await this.fetch(from, to)

        this.pageCache.set(pageIndex, fetched)
        this.pendingPages.delete(pageIndex)
        if (notify) this.notifier?.({})
        return true
      } catch (err) {
        this.pendingPages.set(pageIndex, currentRetries + 1)
        console.error(`[DataProviderBasis] Fetch page ${pageIndex} failed:`, err)
        return false
      }
    })()

    this.pendingPages.set(pageIndex, fetchPromise)
    return fetchPromise
  }
}

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

    // 1. Flush any in-flight local reads
    const activePromises = Array.from(this.pendingPages.values())
        .filter((p): p is Promise<boolean> => p instanceof Promise)

    if (activePromises.length > 0) {
      await Promise.allSettled(activePromises)
    }

    // 2. Check if the currently active record is being deleted
    let activeRecordWasDeleted = false
    if (this.activeRecordIndex !== undefined) {
      const activeRecord = this.getRecord(this.activeRecordIndex, true)
      if (activeRecord && uidSet.has(activeRecord.uid)) {
        activeRecordWasDeleted = true
      }
    }

    // 3. Partition creation drafts vs. persisted DB records
    // const draftUids = uids.filter((uid) => this.draftStore.getRecord(uid) !== undefined)
    const dbUids = uids.filter(uid => !this.draftStore.isNew(uid))

    // 4. Remove creation drafts from DraftStore
    this.draftStore.remove(uids)

    // 5. Update cached DB record count & purge page cache
    if (dbUids.length > 0) {
      await this.deleteRecordsFromDb(dbUids)
      if (this.cachedDbRecordCount !== undefined) {
        this.cachedDbRecordCount = Math.max(0, this.cachedDbRecordCount - dbUids.length)
      }
        // Clear cache & pending page map so virtualizer re-fetches updated indexes
      this.pageCache.clear()
      this.pendingPages.clear()
    }

    // 6. Handle active record state cleanup if deleted
    if (activeRecordWasDeleted) {
      this.activeRecordIndex = undefined
      this.pendingActiveIndex = undefined
      this.notifier?.({ currentRecord: undefined })
    }

    // 7. Notify Virtualizer/UI that track count has changed
    this.notifier?.({ countChanged: true })
  }

  protected applyDraftOverlay(rawRecord: DataRecord | undefined): DataRecord | undefined {
    if (!rawRecord?.uid) return rawRecord
    const draft = this.draftStore.getRecord(rawRecord.uid)
    if (draft) {
      console.log(`Using draft for ${draft.uid}`)
    }
    return draft ?? rawRecord
  }
}

export class ConcreteDataProvider extends BufferedDataProvider {
  private records: Array<DataRecord> = Array.from({ length: MAX_RECORDS }, (_v, k) => ({
    uid: crypto.randomUUID() as string,
    textInput: `value ${k}`,
    data: {},
  }))

  protected recalcDbRecordCount(): Promise<boolean> {
    this.cachedDbRecordCount = this.records.length
    return Promise.resolve(true)
  }

  constructor(pageSize = 50, cacheCapacity = 10) {
    super(pageSize, cacheCapacity)
  }

  public async deleteRecordsFromDb(uids: string[]): Promise<void> {
    this.records = this.records.filter((r) => uids.findIndex((uid) => uid === r.uid) == -1)
    return Promise.resolve()
  }

  public async fetch(fromRecord: number, toRecord: number): Promise<DataRecord[]> {
    await delay(Math.floor(Math.random() * 1201) + 50)
    if (fromRecord <= MAX_RECORDS && toRecord >= fromRecord && toRecord <= MAX_RECORDS) {
      console.log(`loading ${fromRecord} to ${toRecord}`)
      return this.records.slice(fromRecord, toRecord)
    }
    throw Error(
        `it is not possible to fetch records ${fromRecord} to ${toRecord} from the data provider`,
    )
  }
}