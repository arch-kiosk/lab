export interface ViewportContext {
    startPage: number
    endPage: number
}

export interface CacheEvictionStrategy {
    /** Maximum number of page slots the cache is allowed to retain */
    readonly maxSlots: number

    /**
     * Selects a victim page index to evict from a candidate list.
     * Pure strategy logic—has zero knowledge of UI or viewports.
     */
    selectVictim(candidates: number[]): number | undefined
}

export class FifoEvictionStrategy implements CacheEvictionStrategy {
    constructor(public readonly maxSlots: number = 10) {}

    selectVictim(candidates: number[]): number | undefined {
        // In FIFO, candidates array maintains insertion order.
        // Return the oldest candidate (first index).
        return candidates[0]
    }
}

export class PageCache<T> {
    private pages = new Map<number, T[]>()
    private pendingPages = new Set<number>()

    constructor(
        public readonly pageSize: number,
        private readonly strategy: CacheEvictionStrategy
    ) {}

    get maxPages(): number {
        return this.strategy.maxSlots
    }

    get pageCount(): number {
        return this.pages.size
    }

    public hasPage(pageIndex: number): boolean {
        return this.pages.has(pageIndex)
    }

    public isPending(pageIndex: number): boolean {
        return this.pendingPages.has(pageIndex)
    }

    public markPending(pageIndex: number): void {
        this.pendingPages.add(pageIndex)
    }

    public clearPending(pageIndex: number): void {
        this.pendingPages.delete(pageIndex)
    }

    public get(rowIndex: number): { data: T | undefined } | undefined {
        const pageIndex = Math.floor(rowIndex / this.pageSize)
        const offset = rowIndex % this.pageSize
        const page = this.pages.get(pageIndex)

        if (!page) return undefined
        return { data: page[offset] }
    }

    public setPage(
        pageIndex: number,
        data: T[],
        viewport: ViewportContext
    ): void {
        this.pages.set(pageIndex, data)
        this.evictIfNecessary(viewport)
    }

    private evictIfNecessary(viewport: ViewportContext): void {
        if (this.pages.size <= this.strategy.maxSlots) return

        // Domain logic: Filter out pages that currently intersect the active viewport
        const candidates = Array.from(this.pages.keys()).filter(
            (page) => page < viewport.startPage || page > viewport.endPage
        )

        // Delegate victim selection purely to the strategy algorithm
        const victim = this.strategy.selectVictim(candidates)

        if (victim !== undefined) {
            this.pages.delete(victim)
        }
    }
}