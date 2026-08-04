// noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected

import type { DataRecord,DataNotifier } from "./sharedtypes"
import { LruPageCache, PageCache } from "./cache"

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

  /**
   * actually goes to the database and calculates the number of records.
   * this asynchronous operation needs to be debounced by the implementation
   * @returns Promise that resolves to either true or false depending on the
   *          final success of the operation.
   * @protected
   */
  protected abstract recalcDbRecordCount(): Promise<boolean>

  /**
   * actually fetches records from the database
   * this does not need to be debounced.
   * @param fromRecord - first record to fetch
   * @param count - number of records
   * @returns a Promise that resolves to the array of DataRecords
   * @protected
   */
  protected abstract fetchRecordsFromDb(fromRecord: number, count: number): Promise<DataRecord[]>


  abstract recordCount(): number
  abstract addRecord(record: DataRecord): void
  abstract deleteRecords(uids: string[]): Promise<void>
  abstract dataChanged(recordIndex: number, fieldId: string, value: unknown): void

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

  // public dataChanged(recordIndex: number, fieldId: string, value: unknown) {
  //   if (this.activeRecordIndex != recordIndex) throw Error("record is not the active record")
  //   const record = this.getRecord(this.activeRecordIndex, true)
  //   if (record) {
  //     record[fieldId] = value
  //   } else throw Error("Can't access active Record")
  // }

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

  private async fetchPage(
      pageIndex: number,
      currentRetries: number,
      notify = true,
  ): Promise<boolean> {
    const fetchPromise = (async () => {
      try {
        const dbRecordCount = this.getDbRecordCount()
        if (!dbRecordCount) return false

        const from = pageIndex * this.pageSize
        const count = Math.min(this.pageSize, Math.max(0, dbRecordCount - from))
        let fetched: DataRecord[]
        fetched = await this.fetchRecordsFromDb(from, count)

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

