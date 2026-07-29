// oxlint-disable typescript/no-explicit-any
import {LitElement, html, PropertyValues, unsafeCSS, HTMLTemplateResult} from "lit"
import { when } from "lit/directives/when.js"
import {customElement, property, state} from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { createRef, ref, Ref } from "lit/directives/ref.js"

import { VirtualizerController } from "@tanstack/lit-virtual"
import type { VirtualItem } from "@tanstack/virtual-core"

import { DataProvider } from "./dataprovider"
// import {FifoPageCache, LruPageCache, PageCache} from "./cache"
import local_css from "./styles/tanstack-virtualizerlab.sass?inline"
export { DataProvider}

export type RowRenderer = (rowNr: number, rowKey: string, record: Record<string, any>) => HTMLTemplateResult

@customElement("virtualizer-lab")
export class VirtualScrollLayout extends LitElement {
    static styles = unsafeCSS(local_css)
    DEFAULT_CACHE_PAGE_SIZE = 50
    DEFAULT_CACHE_SIZE = 10
    DEFAULT_ROW_HEIGHT = 42
    MAX_PAGE_RETRIES = 3
    private pageSize = this.DEFAULT_CACHE_PAGE_SIZE

    // Internal Injected Dependencies (Managed via setDataProvider)
    private dataProvider?: DataProvider
    // private pageCache?: PageCache<Record<string, any>>
    private pendingPages!: Map<number, "pending" | number>

    // State & Instance variables
    @state() private recordCount!: number

    private scrollContainerRef: Ref<HTMLDivElement> = createRef()
    private devTelemetryRef: Ref<HTMLDivElement> = createRef()

    @property({ type: Number }) rowHeight!: number
    @state() private activeRecordKey?: string

    // Directive Flag: Directs component to measure next available loaded row DOM height
    private recalcRowHeight!: boolean

    private virtualizerController = new VirtualizerController<HTMLDivElement, Element>(this, {
        count: 0,
        getScrollElement: () => this.scrollContainerRef.value ?? null,
        estimateSize: () => this.rowHeight,
        overscan: 5,
    })
    private rowRenderer?: (rowNr: number, rowKey: string, record: Record<string, any>) => HTMLTemplateResult;


    constructor() {
        super()
        this.resetState()
    }

    /**
     *
     * @param dataProvider attaches the DataProvider which feeds the virtual scroller with data
     * @param pageCache some PageCache instance
     * @param cachePageSize number of records per cache page
     */
    public init(
        dataProvider: DataProvider,
        rowRenderer: RowRenderer,
        // pageCache?: PageCache<Record<string, any>>,
        cachePageSize = this.DEFAULT_CACHE_PAGE_SIZE
    ): void {
        if (this.dataProvider === dataProvider) return

        this.dataProvider = dataProvider
        this.rowRenderer = rowRenderer
        this.pageSize = cachePageSize
        this.resetState()

        // if (pageCache) {
        //     pageCache.isProtected = this.isPageVisible
        // } else {
        //     pageCache = new FifoPageCache(this.DEFAULT_CACHE_SIZE, this.isPageVisible)
        // }

        void this.handleDataProviderChange(pageCache)
    }

    /**
     * Handles initialization when a new DataProvider or PageCache is attached.
     * Fetches initial record count from the DataProvider before activating the cache.
     *
     * @param cache the PageCache to use
     * @returns nothing
     * @private
     */
    private async handleDataProviderChange(cache: PageCache<Record<string, any>>) {
        const activeProvider = this.dataProvider
        if (!activeProvider) return

        try {
            const count = await activeProvider.recordCount()

            // Abort if provider was swapped in flight
            if (this.dataProvider !== activeProvider) return

            this.recordCount = count
            this.updateVirtualizerCount(count)

            // Gate component rendering until data is confirmed
            // this.pageCache = cache
        } catch (err) {
            if (this.dataProvider !== activeProvider) return
            console.error("[VirtualScrollLayout] Failed to initialize DataProvider:", err)
            this.resetState()
        }
    }


    private resetState() {
        this.recordCount = 0
        this.rowHeight = this.rowHeight ?? this.DEFAULT_ROW_HEIGHT
        this.recalcRowHeight = true
        this.pageCache = undefined
        this.pendingPages = new Map()
        this.updateVirtualizerCount(0)

        if (this.devTelemetryRef.value) {
            this.devTelemetryRef.value.textContent = "No data"
        }
    }

    /**
     * Public API method to trigger a recalculation on demand
     * requests a component update
     *
     * use case unclear.
     */
    public requestRowHeightRecalc() {
        this.recalcRowHeight = true
        this.requestUpdate()
    }

    protected willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties)
        if (changedProperties.has("rowHeight")) {
            this.recalcRowHeight = true
        }
    }


    private isPageVisible = (pageIndex: number): boolean => {
        const virtualizer = this.virtualizerController.getVirtualizer()
        const virtualItems = virtualizer.getVirtualItems()
        if (!virtualItems.length) return false

        const startPage = Math.floor(virtualItems[0].index / this.pageSize)
        const endPage = Math.floor(virtualItems[virtualItems.length - 1].index / this.pageSize)

        return pageIndex >= startPage && pageIndex <= endPage
    }

    private updateVirtualizerCount(count: number) {
        const virtualizer = this.virtualizerController.getVirtualizer()
        //these leads to a requestUpdate under the hood
        virtualizer.setOptions({
            ...virtualizer.options,
            count,
        })
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties)

        if (!this.pageCache) return

        if (this.recalcRowHeight) {
            const firstLoadedRow = this.shadowRoot?.querySelector<HTMLElement>(".virtual-row[data-loaded]")
            if (firstLoadedRow?.offsetHeight) {
                this.rowHeight = firstLoadedRow.offsetHeight
                this.recalcRowHeight = false

                const virtualizer = this.virtualizerController.getVirtualizer()
                virtualizer.setOptions({ ...virtualizer.options, estimateSize: () => this.rowHeight })
                virtualizer.measure()
            }
        }
        this.updateTelemetry();
        void this.loadVisibleRange()
    }

    private updateTelemetry() {
        if (!this.pageCache) return
        if (import.meta.env?.DEV && this.devTelemetryRef.value) {
            const domRows = this.shadowRoot?.querySelectorAll(".virtual-row").length ?? 0
            // Fix: pageCount -> size, maxPages -> capacity
            this.devTelemetryRef.value.textContent =
                `${domRows} rows in DOM | ${this.pageCache.size}/${this.pageCache.capacity} pages cached`
        }
    }
    /**
     * Scans current viewport indices and triggers fetches for any uncached visible pages.
     *
     * @private
     */
    private async loadVisibleRange() {
        if (!this.pageCache || !this.dataProvider) return

        const virtualizer = this.virtualizerController.getVirtualizer()
        // as long as the user is still actively scrolling we return
        if (virtualizer.isScrolling) return

        const virtualItems = virtualizer.getVirtualItems()
        if (!virtualItems.length) return

        const startPage = Math.floor(virtualItems[0].index / this.pageSize)
        const endPage = Math.floor(virtualItems[virtualItems.length - 1].index / this.pageSize)


        for (let page = startPage; page <= endPage; page++) {
            const status = this.pendingPages.get(page)
            const isPending = status === "pending"
            const retryCount = isPending ? 0 : status ?? 0
            const pageAlreadyDealtWith = this.pageCache.has(page) || isPending || retryCount >= this.MAX_PAGE_RETRIES
            if (!pageAlreadyDealtWith) {
                void this.fetchPage(page, retryCount)
            }
        }
    }

    private async fetchPage(pageIndex: number, currentRetries: number) {
        if (!this.pageCache || !this.dataProvider) return

        const activeCache = this.pageCache
        const activeProvider = this.dataProvider

        this.pendingPages.set(pageIndex, "pending")

        try {

            const from = pageIndex * this.pageSize
            const to = Math.min((pageIndex + 1) * this.pageSize, this.recordCount)

            const fetched = await activeProvider.fetch(from, to)

            // Abort state mutation if provider/cache was swapped in-flight
            if (this.pageCache !== activeCache) return

            this.pageCache.set(pageIndex, fetched)
            this.pendingPages.delete(pageIndex)
            this.requestUpdate()
        } catch (err) {
            if (this.pageCache !== activeCache) return
            this.pendingPages.set(pageIndex, currentRetries + 1)
            console.error(`Attempt ${currentRetries} when loading page ${pageIndex} failed:`, err)
        }
    }

    /**
     * Maps a flat record index to its page and offset inside the PageCache.
     *
     * @param recordIndex Global 0-based record index from the virtualizer.
     * @returns The cached record object, or undefined if the page isn't loaded.
     * @private
     */
    private getRecord(recordIndex: number): Record<string, any> | undefined {
        if (!this.pageCache) return undefined

        const pageIndex = Math.floor(recordIndex / this.pageSize)
        const offset = recordIndex % this.pageSize

        const page = this.pageCache.get(pageIndex)
        return page?.[offset]
    }

    activateRecord = (key: string)=> {
        this.activeRecordKey = key
    }

    private focusChange = (event: FocusEvent) =>  {

            if (event.type === "focusin" && event.currentTarget && event.currentTarget instanceof HTMLElement) {
                console.log(`Got focus for record ${event.currentTarget.id}`)
                this.activateRecord(event.currentTarget.id)
            } else if (event.type === "focusout" && event.currentTarget && event.currentTarget instanceof HTMLElement){
                console.log(`Lost focus for record ${event.currentTarget.id}`)

            }
    }

    renderVirtualRow(row: VirtualItem, record?: Record<string, any>) {
        return this.rowRenderer && record ? html`
            <div class="row-selector${this.activeRecordKey == row.key?' active':''}"></div>
            <div class="row-content">${this.rowRenderer(row.index, row.key as string, record)}</div>` : undefined
    }

    render() {
        if (!this.pageCache) {
            return html`
                ${when(import.meta.env?.DEV, () => html`
                    <div id="dev-row-count" ${ref(this.devTelemetryRef)}>no data</div>`)
                }
                <div class="scroll-container empty-state">please wait ...</div>
            `
        }

        if (!this.rowRenderer) {
            return html`no row renderer assigned`
        }

        const virtualizer = this.virtualizerController.getVirtualizer()

        return html`
            ${when(import.meta.env?.DEV, () => html`
                <div id="dev-row-count" ${ref(this.devTelemetryRef)}></div>`
                )}
            <div class="scroll-container" ${ref(this.scrollContainerRef)}>
                <div class="scroll-track" style="height: ${virtualizer.getTotalSize()}px;">
                    ${repeat(
                        virtualizer.getVirtualItems(),
                        (row: VirtualItem) => row.key,
                        (row: VirtualItem) => {
                            const record = this.getRecord(row.index)
                            const renderedRow = this.renderVirtualRow(row, record)
                            const isLoaded = Boolean(renderedRow)
                            return html`
                                            <div
                                                id=${row.key} 
                                                class="virtual-row"
                                                ?data-loaded=${isLoaded}
                                                @focusin="${this.focusChange}"
                                                @focusout="${this.focusChange}"
                                                style="height:${this.rowHeight}px;transform: translateY(${row.start}px);"
                                            >
                                                ${isLoaded
                                ? renderedRow : html`<div class="sk-wave-bar"></div>`}
                                            </div>
                                        `
                    })}
                </div>
            </div>
        `
    }
}