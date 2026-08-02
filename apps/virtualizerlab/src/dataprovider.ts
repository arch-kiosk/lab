// oxlint-disable typescript/no-explicit-any typescript/no-redundant-type-constituents
import delay from "delay"
import { DataRecord } from "./sharedtypes"

import { LruPageCache, PageCache } from "./cache"

const MAX_RECORDS = 1000

//This tries to suppress booleans and promises
export type DataNotification = {
  currentRecord?: number
  countChanged?: boolean
}

export type DataNotifier = (notification?: DataNotification) => void

export interface DataProvider {
  recordCount(): number
  getRecord(
    index: number,
    bufferedOnly?: boolean,
    notify?: (index: number) => void,
  ): DataRecord | undefined
  setActiveRecord(index: number): void
  setNotifier(notifier: DataNotifier): void
  dataChanged(recordIndex: number, fieldId: string, value: unknown): void
  addRecord(record: DataRecord): void
  getTelemetry?(): { cached: number; capacity: number }
}

export abstract class DataProviderBasis implements DataProvider {
  protected pageSize: number
  protected pageCache: PageCache<DataRecord>
  protected pendingPages = new Map<number, Promise<boolean> | number>()
  protected protectedRows = new Set<number>()
  protected maxRetries = 3
  private activeRecordIndex?: number
  private pendingActiveIndex?: number

  private notifier?: DataNotifier

  protected constructor(pageSize = 50, cacheCapacity = 10) {
    this.pageSize = pageSize
    this.pageCache = new LruPageCache(cacheCapacity, this.isPageProtected)
  }

  abstract recordCount(): number
  abstract fetch(fromRecord: number, toRecord: number): Promise<DataRecord[]>
  abstract addRecord(record: DataRecord): void

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

  public protectRow(rowIndex: number): void {
    this.protectedRows.add(rowIndex)
  }

  public unprotectRow(rowIndex: number): void {
    this.protectedRows.delete(rowIndex)
  }

  public getTelemetry() {
    return {
      cached: this.pageCache.size,
      capacity: this.pageCache.capacity,
    }
  }

  private isPageProtected = (pageIndex: number): boolean => {
    for (const rowIndex of this.protectedRows) {
      if (Math.floor(rowIndex / this.pageSize) === pageIndex) {
        return true
      }
    }
    return false
  }

  private async fetchPage(
    pageIndex: number,
    currentRetries: number,
    notify = true,
  ): Promise<boolean> {
    const fetchPromise = (async () => {
      try {
        const from = pageIndex * this.pageSize
        const to = Math.min(from + this.pageSize, this.recordCount())
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

export class ConcreteDataProvider extends DataProviderBasis {
  addRecord(_record: DataRecord): void {
    throw new Error("Method not implemented.")
  }
  recordCount(): number {
    return MAX_RECORDS
  }

  constructor(pageSize = 50, cacheCapacity = 10) {
    super(pageSize, cacheCapacity)
  }

  async fetch(fromRecord: number, toRecord: number): Promise<DataRecord[]> {
    await delay(Math.floor(Math.random() * 1201) + 50)
    if (fromRecord <= MAX_RECORDS && toRecord >= fromRecord && toRecord <= MAX_RECORDS) {
      console.log(`loading ${fromRecord} to ${toRecord}`)
      return Array.from({ length: toRecord - fromRecord }, (_v, k) => ({
        uid: crypto.randomUUID(),
        textInput: `value ${fromRecord + k}`,
        data: {},
      }))
    }
    throw Error(
      `it is not possible to fetch records ${fromRecord} to ${toRecord} from the data provider`,
    )
  }
}
