// oxlint-disable typescript/no-explicit-any
import delay from "delay"
import { LruPageCache, PageCache } from "./cache"

const MAX_RECORDS = 1000

//This tries to suppress booleans and promises
export type DataRecord = Record<string, any> & object & { then?: never }
export type DataNotification = {currentRecord? : number}

export type DataNotifier = (notification?: DataNotification) => void

export interface DataProvider {
    recordCount(): number
    getRecord(index: number, bufferedOnly?: boolean): DataRecord | undefined
    setActiveRecord(index: number) : void
    setNotifier?(notifier: DataNotifier): void
    getTelemetry?(): { cached: number; capacity: number }
}

export abstract class DataProviderBasis implements DataProvider {
    protected pageSize: number
    protected pageCache: PageCache<DataRecord>
    protected pendingPages = new Map<number, Promise<boolean> | number>()
    protected protectedRows = new Set<number>()
    protected maxRetries = 3
    // @ts-ignore
    private activeRecordIndex?: number
    private pendingActiveIndex?: number

    private notifier?: DataNotifier

    protected constructor(pageSize = 50, cacheCapacity = 10) {
        this.pageSize = pageSize
        this.pageCache = new LruPageCache(cacheCapacity, this.isPageProtected)
    }

    abstract recordCount(): number
    abstract fetch(fromRecord: number, toRecord: number): Promise<DataRecord[]>

    public setNotifier(notifier: DataNotifier): void {
        this.notifier = notifier
    }

    public setActiveRecord(index: number) {
        this.pendingActiveIndex = index

        const r = this.getRecord(index, false, (
            loadedIndex: number, _: DataRecord | undefined) => {

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

    public getRecord(index: number,
                     bufferedOnly = false,
                     notify?: (index: number, r: DataRecord | undefined) => void): DataRecord | undefined {
        const pageIndex = Math.floor(index / this.pageSize)
        const offset = index % this.pageSize

        if (this.pageCache.has(pageIndex)) {
            return this.pageCache.get(pageIndex)?.[offset]
        }

        if (!bufferedOnly) {
            if (notify) {
                void this.ensurePage(pageIndex, false).then((success) => {
                    notify(index, success ? this.pageCache.get(pageIndex)?.[offset] : undefined)
                })
            } else {
                void this.ensurePage(pageIndex)
            }
        }

        return undefined
    }

    private ensurePage(pageIndex: number, notifyAfterFetch=true): Promise<boolean> {
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

    private async fetchPage(pageIndex: number, currentRetries: number, notify=true): Promise<boolean> {
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
            return Array.from({ length: toRecord - fromRecord }, (_, idx) => ({
                id: `REC${fromRecord + idx}`,
                data: {},
            }))
        }
        throw Error(`it is not possible to fetch records ${fromRecord} to ${toRecord} from the data provider`)
    }
}