export interface PageCache<T> {
    readonly size: number
    readonly capacity: number
    isProtected?: (key: number) => boolean
    get(key: number): T[] | undefined
    set(key: number, page: T[]): void
    has(key: number): boolean
    delete(key: number): boolean
    findPageAndOffset(finder: (page: T[]) => number): { pageIndex: number; offset: number } | undefined
}

export class FifoPageCache<T> implements PageCache<T> {
    public readonly capacity: number
    public isProtected?: (key: number) => boolean

    private pages = new Map<number, T[]>()
    private queue: number[] = []

    constructor(
        capacity: number,
        isProtected?: (key: number) => boolean
    ) {
        this.capacity = capacity
        this.isProtected = isProtected
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
            const candidateIndex = this.queue.findIndex(
                k => !this.isProtected || !this.isProtected(k)
            )

            if (candidateIndex === -1) break

            const [evictedKey] = this.queue.splice(candidateIndex, 1)
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
    public isProtected?: (key: number) => boolean

    private pages = new Map<number, T[]>()

    constructor(
        capacity: number,
        isProtected?: (key: number) => boolean
    ) {
        this.capacity = capacity
        this.isProtected = isProtected
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
            let evictedKey: number | undefined

            for (const k of this.pages.keys()) {
                if (!this.isProtected || !this.isProtected(k)) {
                    evictedKey = k
                    break
                }
            }

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