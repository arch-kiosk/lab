// oxlint-disable typescript/unbound-method typescript/no-explicit-any
import {customElement, property, state} from "lit/decorators.js";
import {html, HTMLTemplateResult, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS} from "lit";
import {DataProvider} from "#src/dataprovider";
import "@lit-labs/virtualizer";
import local_css from "./styles/virtualizerlab.sass?inline"
export {DataProvider}

@customElement("virtualizer-lab")
export class UIComponent extends LitElement {
    @property() dataProvider?: DataProvider
    @state() recordCount?: number
    @state() private records: (null | Record<string, any>)[] = []
    static styles = unsafeCSS(local_css)

    private fetchedPages = new Set<number>()
    private fetchDebounceTimer: any = null
    private pendingRange: {first: number; last: number} | null = null
    private pageSize = 50

    connectedCallback() {
        super.connectedCallback();

    }

    protected async updated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (_changedProperties.has("dataProvider")) {
            this.recordCount = await this.dataProvider?.recordCount() ?? 0
            this.records = Array.from({length: this.recordCount}, (_e,idx) => {return {"id": idx, "data": null}})
        }
    }

    /**
     * Fires ONLY when the virtualizer's visible window index changes.
     * NO queries are triggered inside renderItem().
     */
    private handleRangeChanged(e: { first: number, last: number } & Event) {
        console.log(`rangeChanged tick: first=${e.first}`)

        this.pendingRange = {first: e.first, last: e.last}
        const virtualizerNodesCount = this.shadowRoot?.querySelectorAll(".sk-wave-bar").length
        if (import.meta.env.DEV) {
            const info = this.shadowRoot?.getElementById("row-count")
            if (info) info.textContent = `${virtualizerNodesCount} rows in mem`
        }

        // Debounce: Wait until the user slows down scrolling before querying SQLite
        clearTimeout(this.fetchDebounceTimer);
        this.fetchDebounceTimer = setTimeout(this.fetchVisibleRange.bind(this), 60); // 60ms debounce window
    }

    private async fetchVisibleRange() {
        if (!this.pendingRange) return;

        const { first, last } = this.pendingRange;
        const startPage = Math.floor(first / this.pageSize);
        const endPage = Math.floor(last / this.pageSize);
        // Collect pages that aren't loaded yet
        const pagesToFetch: number[] = [];
        for (let p = startPage; p <= endPage; p++) {
            if (!this.fetchedPages.has(p)) {
                pagesToFetch.push(p);
            }
        }

        if (pagesToFetch.length === 0) return; // All required items are already in memory

        // Mark pages as pending immediately so we don't duplicate requests
        pagesToFetch.forEach((p) => this.fetchedPages.add(p));

        // Batch query SQLite for the full missing range in ONE round-trip
        const minOffset = pagesToFetch[0] * this.pageSize;
        const totalToFetch = pagesToFetch.length * this.pageSize;

        const records = await this.dataProvider?.fetch(minOffset, minOffset + totalToFetch) ?? [];
        console.log(`got records`, records)
        // Populate sparse array in place
        for (let i = 0; i < records.length; i++) {
            this.records[minOffset + i] = records[i];
        }

        // Trigger ONE single Lit re-render for the newly arrived batch
        this.records = [...this.records];
    }




    renderRecord(item: Record<string, any>, _index: number) : HTMLTemplateResult {
            if (item.data) {
                console.log(`rendering ${item.id}`)
                return html`
                    <div style="box-sizing: border-box;height: 2rem; padding: 1rem">${item.id} - ${item.data}</div>
                `
            } else {
                    return html`
                        <div class="sk-wave-bar" style="box-sizing: border-box;height: 2rem; width: 95%;padding: 1rem"></div>
                    `}
    }

    protected renderRecords() {
        return html`
            ${import.meta.env.DEV?html`<div id="row-count" class="dev-row-count"></div>`:nothing}
<!--            <div class="scroller" style="background: lightgrey;height: 95vh; " >-->
                <lit-virtualizer style="height: 95vh" 
                        scroller
                        .items=${this.records} 
                        .renderItem=${this.renderRecord} 
                        @rangeChanged=${this.handleRangeChanged}></lit-virtualizer>
<!--            </div>-->
    `

    }
    protected render(): TemplateResult {
        if (this.dataProvider && this.recordCount) {
            return this.renderRecords()
        } else {
            return html`<div>waiting for data provider</div>`
        }
    }
}