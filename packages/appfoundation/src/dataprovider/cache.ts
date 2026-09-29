export interface PageCache<T> {
    readonly size: number
    readonly capacity: number
    get(key: number): T[] | undefined
    set(key: number, page: T[]): void
    has(key: number): boolean
    delete(key: number): boolean
    clear(): void
    findPageAndOffset(finder: (page: T[]) => number): { pageIndex: number; offset: number } | undefined
}

export class FifoPageCache<T> implements PageCache<T> {
    public readonly capacity: number

    private pages = new Map<number, T[]>()
    private queue: number[] = []

    constructor(capacity: number) {
        this.capacity = capacity
    }

    public clear() {
        this.pages = new Map<number, T[]>()
        this.queue = []
    }

    public get size(): number {
        return this.pages.size
    }

    public get(key: number): T[] | undefined {
        return this.pages.get(key)
    }

    public has(key: number): boolean {
        return this.pages.has(key)
    }

    public set(key: number, page: T[]): void {
        if (!this.pages.has(key)) {
            this.queue.push(key)
        }
        this.pages.set(key, page)
        this.evict()
    }

    public delete(key: number): boolean {
        this.queue = this.queue.filter(k => k !== key)
        return this.pages.delete(key)
    }

    private evict(): void {
        while (this.pages.size > this.capacity) {
            // FIFO: shift the oldest inserted key directly off the queue
            const evictedKey = this.queue.shift()
            if (evictedKey === undefined) break
            this.pages.delete(evictedKey)
        }
    }

    public findPageAndOffset(finder: (page: T[]) => number): { pageIndex: number; offset: number } | undefined {
        for (const [pageIndex, page] of this.pages.entries()) {
            const offset = finder(page)
            if (offset >= 0) {
                return { pageIndex, offset }
            }
        }
        return undefined
    }
}

export class LruPageCache<T> implements PageCache<T> {
    public readonly capacity: number

    private pages = new Map<number, T[]>()

    constructor(capacity: number) {
        this.capacity = capacity
    }

    public clear() {
        this.pages = new Map<number, T[]>()
    }

    public get size(): number {
        return this.pages.size
    }

    public has(key: number): boolean {
        return this.pages.has(key)
    }

    public delete(key: number): boolean {
        return this.pages.delete(key)
    }

    public get(key: number): T[] | undefined {
        const page = this.pages.get(key)
        if (page) {
            // Touch key: move to back of Map order (MRU)
            this.pages.delete(key)
            this.pages.set(key, page)
        }
        return page
    }

    public set(key: number, page: T[]): void {
        if (this.pages.has(key)) {
            this.pages.delete(key)
        }
        this.pages.set(key, page)
        this.evict()
    }

    private evict(): void {
        while (this.pages.size > this.capacity) {
            // LRU: grab the first key in Map iteration order (the oldest/least recently used)
            const oldestKey = this.pages.keys().next().value
            if (oldestKey === undefined) break
            this.pages.delete(oldestKey)
        }
    }

    public findPageAndOffset(finder: (page: T[]) => number): { pageIndex: number; offset: number } | undefined {
        for (const [pageIndex, page] of this.pages.entries()) {
            const offset = finder(page)
            if (offset >= 0) {
                return { pageIndex, offset }
            }
        }
        return undefined
    }
}