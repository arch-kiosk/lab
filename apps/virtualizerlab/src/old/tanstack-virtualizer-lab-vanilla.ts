// oxlint-disable typescript/no-explicit-any
/** This is the version of the virtualizer using only Lit and the core Tanstack virtualizer, not @tanstack/lit-virtual.
 * I keep it for reference
 */

import {LitElement, html, PropertyValues, unsafeCSS, nothing} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
    Virtualizer,
    elementScroll,
    observeElementOffset,
    observeElementRect,
    type VirtualItem,
} from "@tanstack/virtual-core";
import { DataProvider } from "./dataprovider";
import local_css from "./styles/tanstack-virtualizerlab.sass?inline";

const PAGE_SIZE = 50;

@customElement("virtualizer-lab")
export class UIComponent extends LitElement {
    static styles = unsafeCSS(local_css);

    @property({ type: Object }) dataProvider?: DataProvider;

    @state() private recordCount = 0;
    @state() private records: (Record<string, any> | null)[] = [];

    private loadedPages = new Set<number>();
    private pendingPages = new Set<number>();
    private cleanupVirtualizer?: () => void;

    private virtualizer = new Virtualizer<HTMLDivElement, HTMLDivElement>({
        count: 0,
        getScrollElement: () => this.getScrollContainer(),
        estimateSize: () => 48,
        overscan: 5,
        observeElementRect,
        observeElementOffset,
        scrollToFn: elementScroll,
        onChange: () => {
            this.requestUpdate();
        },
    });

    private getScrollContainer(): HTMLDivElement | null {
        return this.shadowRoot?.querySelector<HTMLDivElement>(".scroll-container") ?? null;
    }

    async connectedCallback() {
        super.connectedCallback();
        if (!this.dataProvider) {
            this.recordCount = 0
            // this.dataProvider = new DataProvider();
            return
        }

        const count = await this.dataProvider.recordCount();

        this.records = Array.from({ length: count }, (_, idx) => ({
            id: idx,
            data: null,
        }));
        this.recordCount = count;
    }

    firstUpdated() {
        // Mount virtualizer event listeners once Shadow DOM elements exist
        this.cleanupVirtualizer = this.virtualizer._didMount();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanupVirtualizer?.();
    }

    protected willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties);

        if (changedProperties.has("recordCount")) {
            this.virtualizer.setOptions({
                ...this.virtualizer.options,
                count: this.recordCount,
            });
        }
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);

        // // Notify core virtualizer to recalculate DOM measurements after render
        this.virtualizer._willUpdate();
        //
        if (import.meta.env?.DEV) {
            const virtualizerNodesCount = this.shadowRoot?.querySelectorAll(".virtual-row").length ?? 0;
            const info = this.shadowRoot?.getElementById("dev-row-count");
            if (info) {
                info.textContent = `${virtualizerNodesCount} rows in mem`;
            }
        }

        void this.loadVisibleRange();
    }

    private async loadVisibleRange() {
        if (!this.dataProvider || this.records.length === 0) return;

        // Skip data fetching while the user/browser is actively scrolling
        if (this.virtualizer.isScrolling) return;

        const virtualItems = this.virtualizer.getVirtualItems();
        if (virtualItems.length === 0) return;

        const firstIndex = virtualItems[0].index;
        const lastIndex = virtualItems[virtualItems.length - 1].index;

        const startPage = Math.floor(firstIndex / PAGE_SIZE);
        const endPage = Math.floor(lastIndex / PAGE_SIZE);

        for (let page = startPage; page <= endPage; page++) {
            if (!this.loadedPages.has(page) && !this.pendingPages.has(page)) {
                void this.fetchPage(page);
            }
        }
    }

    private async fetchPage(pageIndex: number) {
        if (!this.dataProvider) return;

        this.pendingPages.add(pageIndex);
        const fromRecord = pageIndex * PAGE_SIZE;
        const toRecord = Math.min((pageIndex + 1) * PAGE_SIZE, this.recordCount);

        try {
            const fetchedRecords = await this.dataProvider.fetch(fromRecord, toRecord);

            const updatedRecords = [...this.records];
            fetchedRecords.forEach((rec, idx) => {
                updatedRecords[fromRecord + idx] = rec;
            });

            this.records = updatedRecords;
            this.loadedPages.add(pageIndex);
        } catch (error) {
            console.error(`Failed to fetch page ${pageIndex}:`, error);
        } finally {
            this.pendingPages.delete(pageIndex);
        }
    }

    render() {
        const virtualItems = this.virtualizer.getVirtualItems();
        const totalSize = this.virtualizer.getTotalSize();

        return html`
            ${import.meta.env?.DEV ? html`
                <div id="dev-row-count">0 rows in mem</div>` : nothing}
            <div class="scroll-container">
                <div class="scroll-track" style="height: ${totalSize}px;">
                    ${virtualItems.map((virtualRow: VirtualItem) => {
            const record = this.records[virtualRow.index];
            const isLoaded = record && record.data !== null;

            return html`
                            <div
                                class="virtual-row"
                                style="transform: translateY(${virtualRow.start}px);"
                            >
                                ${isLoaded
                ? html`${virtualRow.index} - ${record.data}`
                : html`<div class="sk-wave-bar"></div>`}
                            </div>
                        `;
        })}
                </div>
            </div>
        `;
    }
}