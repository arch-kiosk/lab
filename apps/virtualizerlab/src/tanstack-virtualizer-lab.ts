// oxlint-disable typescript/no-explicit-any
import { LitElement, html, PropertyValues, unsafeCSS, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { createRef, ref, Ref } from "lit/directives/ref.js"

import { VirtualizerController } from "@tanstack/lit-virtual"
import type { VirtualItem } from "@tanstack/virtual-core"

import { DataProvider } from "./dataprovider"
import {
    PageCache,
    FifoEvictionStrategy,
    CacheEvictionStrategy,
    type ViewportContext,
} from "./cache"
import local_css from "./styles/tanstack-virtualizerlab.sass?inline"

export { DataProvider, FifoEvictionStrategy }

@customElement("virtualizer-lab")
export class UIComponent extends LitElement {
    static styles = unsafeCSS(local_css)

    // Page Record Batch Size
    @property({ type: Number }) pageSize = 50

    // Internal Injected Dependencies (Managed via setDataProvider)
    private dataProvider?: DataProvider
    private evictionStrategy: CacheEvictionStrategy = new FifoEvictionStrategy(10)

    // State & Instance variables
    @state() private recordCount!: number

    private scrollContainerRef: Ref<HTMLDivElement> = createRef()
    private devTelemetryRef: Ref<HTMLDivElement> = createRef()

    private pageCache?: PageCache<Record<string, any>>
    private rowHeight!: number

    // Directive Flag: Directs component to measure next available loaded row DOM height
    private recalcRowHeight!: boolean

    private virtualizerController = new VirtualizerController<HTMLDivElement, Element>(this, {
        count: 0,
        getScrollElement: () => this.scrollContainerRef.value ?? null,
        estimateSize: () => this.rowHeight,
        overscan: 5,
    })

    constructor() {
        super()
        this.resetState()
    }

    /**
     * Imperative API to attach a DataProvider and an optional EvictionStrategy atomically.
     */
    public setDataProvider(
        dataProvider: DataProvider,
        evictionStrategy: CacheEvictionStrategy = new FifoEvictionStrategy(10)
    ): void {
        this.dataProvider = dataProvider
        this.evictionStrategy = evictionStrategy
        this.resetState()
        void this.handleDataProviderChange()
    }

    private resetState() {
        this.recordCount = 0
        this.rowHeight = 42
        this.recalcRowHeight = true
        this.pageCache = undefined
        this.updateVirtualizerCount(0)

        if (this.devTelemetryRef.value) {
            this.devTelemetryRef.value.textContent = "Dormant (No DataProvider)"
        }
    }

    protected willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties)

        if (changedProperties.has("pageSize") && this.dataProvider) {
            this.resetState()
            void this.handleDataProviderChange()
        }
    }

    private async handleDataProviderChange() {
        const activeProvider = this.dataProvider
        if (!activeProvider) return

        try {
            const count = await activeProvider.recordCount()

            // Abort if provider was swapped in flight
            if (this.dataProvider !== activeProvider) return

            this.pageCache = new PageCache<Record<string, any>>(
                this.pageSize,
                this.evictionStrategy
            )
            this.recordCount = count
            this.updateVirtualizerCount(count)
        } catch (err) {
            if (this.dataProvider !== activeProvider) return
            console.error("Failed to initialize DataProvider:", err)
            this.resetState()
        }
    }

    private updateVirtualizerCount(count: number) {
        const virtualizer = this.virtualizerController.getVirtualizer()
        virtualizer.setOptions({
            ...virtualizer.options,
            count,
        })
    }

    /** Public API method to trigger a recalculation on demand */
    public requestRowHeightRecalc() {
        this.recalcRowHeight = true
        this.requestUpdate()
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

        if (import.meta.env?.DEV && this.devTelemetryRef.value) {
            const domRows = this.shadowRoot?.querySelectorAll(".virtual-row").length ?? 0
            this.devTelemetryRef.value.textContent =
                `${domRows} rows in DOM | ${this.pageCache.pageCount}/${this.pageCache.maxPages} pages cached`
        }

        void this.loadVisibleRange()
    }

    private async loadVisibleRange() {
        if (!this.pageCache || !this.dataProvider) return

        const virtualizer = this.virtualizerController.getVirtualizer()
        if (virtualizer.isScrolling) return

        const virtualItems = virtualizer.getVirtualItems()
        if (!virtualItems.length) return

        const PAGE_SIZE = this.pageCache.pageSize
        const startPage = Math.floor(virtualItems[0].index / PAGE_SIZE)
        const endPage = Math.floor(virtualItems[virtualItems.length - 1].index / PAGE_SIZE)

        const viewport: ViewportContext = { startPage, endPage }

        for (let page = startPage; page <= endPage; page++) {
            if (!this.pageCache.hasPage(page) && !this.pageCache.isPending(page)) {
                void this.fetchPage(page, viewport)
            }
        }
    }

    private async fetchPage(pageIndex: number, viewport: ViewportContext) {
        if (!this.pageCache || !this.dataProvider) return

        const activeCache = this.pageCache
        const activeProvider = this.dataProvider

        activeCache.markPending(pageIndex)

        try {
            const PAGE_SIZE = activeCache.pageSize
            const from = pageIndex * PAGE_SIZE
            const to = Math.min((pageIndex + 1) * PAGE_SIZE, this.recordCount)

            const fetched = await activeProvider.fetch(from, to)

            if (this.pageCache !== activeCache) return

            this.pageCache.setPage(pageIndex, fetched, viewport)
            this.requestUpdate()
        } catch (err) {
            console.error(`Failed loading page ${pageIndex}:`, err)
        } finally {
            activeCache.clearPending(pageIndex)
        }
    }

    render() {
        if (!this.pageCache) {
            return html`
                ${import.meta.env?.DEV
                ? html`<div id="dev-row-count" ${ref(this.devTelemetryRef)}>Dormant (No DataProvider)</div>`
                : nothing}
                <div class="scroll-container empty-state">Waiting for DataProvider...</div>
            `
        }

        const virtualizer = this.virtualizerController.getVirtualizer()

        return html`
            ${import.meta.env?.DEV
            ? html`<div id="dev-row-count" ${ref(this.devTelemetryRef)}></div>`
            : nothing}
            <div class="scroll-container" ${ref(this.scrollContainerRef)}>
                <div class="scroll-track" style="height: ${virtualizer.getTotalSize()}px;">
                    ${repeat(
            virtualizer.getVirtualItems(),
            (row: VirtualItem) => row.key,
            (row: VirtualItem) => {
                const record = this.pageCache?.get(row.index)
                const isLoaded = record?.data != null

                return html`
                                <div
                                    class="virtual-row"
                                    ?data-loaded=${isLoaded}
                                    style="transform: translateY(${row.start}px);"
                                >
                                    ${isLoaded
                    ? `${row.index} - ${record.data}`
                    : html`<div class="sk-wave-bar"></div>`}
                                </div>
                            `
            }
        )}
                </div>
            </div>
        `
    }
}