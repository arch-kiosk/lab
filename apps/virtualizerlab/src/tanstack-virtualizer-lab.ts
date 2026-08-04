// oxlint-disable typescript/no-explicit-any
import { LitElement, html, PropertyValues, unsafeCSS, HTMLTemplateResult } from "lit"
import { when } from "lit/directives/when.js"
import { customElement, property, state } from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { createRef, ref, Ref } from "lit/directives/ref.js"

import { VirtualizerController } from "@tanstack/lit-virtual"
import type { VirtualItem } from "@tanstack/virtual-core"

import {DataProvider} from "./dataprovider"

import local_css from "./styles/tanstack-virtualizerlab.sass?inline"
import {DataNotification} from "#src/sharedtypes";

export type RowRenderer = (
    rowNr: number,
    rowKey: string,
    record: Record<string, any>
) => HTMLTemplateResult

@customElement("virtualizer-lab")
export class VirtualScrollLayout extends LitElement {
    static styles = unsafeCSS(local_css)

    DEFAULT_ROW_HEIGHT = 42

    @property({ type: Number, attribute: "rowheight" })
    rowHeight = this.DEFAULT_ROW_HEIGHT

    @state()
    private recordCount = 0

    @property({reflect: true, type: Number })
    private activeRecordIndex?: number

    private dataProvider?: DataProvider
    private rowRenderer?: RowRenderer

    private scrollContainerRef: Ref<HTMLDivElement> = createRef()
    private devTelemetryRef: Ref<HTMLDivElement> = createRef()

    private recalcRowHeight = true

    private virtualizerController = new VirtualizerController<HTMLDivElement, Element>(this, {
        count: 0,
        getScrollElement: () => this.scrollContainerRef.value ?? null,
        estimateSize: () => this.rowHeight,
        overscan: 5,
    })

    public notifyDataReady = (notification?: DataNotification): void => {
        console.log("notified:", notification)
        let updateRequired = true

        if (notification) {
            if ("currentRecord" in notification) {
                this.activeRecordIndex = notification.currentRecord
                updateRequired = false
            }

            if ("countChanged" in notification) {
                this.recordCount = this.dataProvider!.recordCount() ?? 0
                this.updateVirtualizerCount(this.recordCount)
                updateRequired = false
            }

        }

        if (updateRequired) this.requestUpdate()
    }

    public init(dataProvider: DataProvider, rowRenderer: RowRenderer): void {
        if (this.dataProvider === dataProvider) {
            this.rowRenderer = rowRenderer
            return
        }

        this.dataProvider = dataProvider
        this.rowRenderer = rowRenderer
        this.resetState()

        const count = dataProvider.recordCount() ?? 0
        this.recordCount = count
        this.updateVirtualizerCount(count)

        this.requestUpdate()
    }

    private resetState() {
        this.recordCount = 0
        this.recalcRowHeight = true
        this.updateVirtualizerCount(0)

        if (this.devTelemetryRef.value) {
            this.devTelemetryRef.value.textContent = "No data"
        }
    }

    public requestRowHeightRecalc() {
        this.recalcRowHeight = true
        this.requestUpdate()
    }

    protected willUpdate(changedProperties: PropertyValues) {
        super.willUpdate(changedProperties)
        if (changedProperties.has("rowHeight")) {
            const virtualizer = this.virtualizerController.getVirtualizer()
            virtualizer.setOptions({ ...virtualizer.options, estimateSize: () => this.rowHeight })
        }
    }

    private updateVirtualizerCount(count: number) {
        const virtualizer = this.virtualizerController.getVirtualizer()
        virtualizer.setOptions({
            ...virtualizer.options,
            count,
        })
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties)

        if (!this.dataProvider) return

        if (this.recalcRowHeight) {
            const firstLoadedRow = this.shadowRoot?.querySelector<HTMLElement>(".virtual-row[data-loaded]")
            if (firstLoadedRow?.offsetHeight) {
                const measuredHeight = firstLoadedRow.offsetHeight
                if (measuredHeight !== this.rowHeight) {
                    this.rowHeight = measuredHeight
                    const virtualizer = this.virtualizerController.getVirtualizer()
                    virtualizer.setOptions({ ...virtualizer.options, estimateSize: () => this.rowHeight })
                    virtualizer.measure()
                }
                this.recalcRowHeight = false
            }
        }

        this.updateTelemetry()
    }

    private updateTelemetry() {
        if (import.meta.env?.DEV && this.devTelemetryRef.value) {
            const domRows = this.shadowRoot?.querySelectorAll(".virtual-row").length ?? 0
            this.devTelemetryRef.value.textContent = `${domRows} rows in DOM`
        }
    }

    public activateRecord = (index: number | string) => {
        this.dataProvider?.setActiveRecord(typeof index === "number" ? index : Number(index))
    }

    private focusChange = (event: FocusEvent) => {
        if (event.type === "focusin" && event.currentTarget && event.currentTarget instanceof HTMLElement) {
            console.log(`Got focus for record ${event.currentTarget.id}`)
            if (event.currentTarget.dataset.index) this.activateRecord(event.currentTarget.dataset.index)
        } else if (event.type === "focusout" && event.currentTarget && event.currentTarget instanceof HTMLElement) {
            console.log(`Lost focus for record ${event.currentTarget.id}`)
        }
    }

    private dataChanged = (event: Event) => {
        const element = event.target as HTMLInputElement
        const row = (event.currentTarget as HTMLElement).dataset.index
        console.log(`${element.id} changed to ${element.value}`)
        this.dataProvider?.dataChanged(Number(row), element.id, element.value)
    }

    private renderVirtualRow(row: VirtualItem, record?: Record<string, any>) {
        return this.rowRenderer && record
            ? html`
                    <div class="row-selector ${this.activeRecordIndex === row.index ? " active" : ""}"></div>
                    <div class="row-content" style="flex: 1; height: 100%; display: flex;">
                        ${this.rowRenderer(row.index, row.key as string, record)}
                    </div>
            `
            : undefined
    }

    render() {
        if (!this.dataProvider) {
            return html`
                ${when(import.meta.env?.DEV, () => html`
                    <div id="dev-row-count" ${ref(this.devTelemetryRef)}>no data</div>`)
                }
                <div class="scroll-container empty-state" part="scroll-container empty-state">please wait ...</div>
            `
        }

        if (!this.rowRenderer) {
            return html`no row renderer assigned`
        }

        const virtualizer = this.virtualizerController.getVirtualizer()

        return html`
            ${when(import.meta.env?.DEV, () => html`
                
                <div id="dev-row-count" ${ref(this.devTelemetryRef)}>
                </div>`
            )}
            <div
                    class="scroll-container"
                    part="scroll-container"
                    ${ref(this.scrollContainerRef)}
                    style="height: 100%; overflow: auto; position: relative;">
                <div class="scroll-track" part="scroll-track" style="position: relative; width: 100%; height: ${virtualizer.getTotalSize()}px;">
                    ${repeat(
                            virtualizer.getVirtualItems(),
                            (row: VirtualItem) => row.key as string,
                            (row: VirtualItem) => {
                                // While scrolling, only get cached records (don't trigger fetches).
                                // When scrolling stops, fetch missing records for visible rows.
                                let record = this.dataProvider!.getRecord(row.index, virtualizer.isScrolling)
                                const renderedRow = this.renderVirtualRow(row, record)
                                const isLoaded = Boolean(renderedRow)

                                return html`
                                    <div
                                            id="ROW${row.index}"
                                            data-index="${row.index}"
                                            data-uid="${record?.uid}"
                                            class="virtual-row"
                                            ?data-loaded=${isLoaded}
                                            @focusin="${this.focusChange}"
                                            @focusout="${this.focusChange}"
                                            @input="${this.dataChanged}"
                                            style="position: absolute; top: 0; left: 0; width: 100%; height: ${this.rowHeight}px; transform: translateY(${row.start}px); display: flex; align-items: center;"
                                    >
                                        ${isLoaded
                                                ? renderedRow
                                                : html`<div class="sk-wave-bar" part="skeleton"></div>`}
                                    </div>
                                `
                            }
                    )}
                </div>
            </div>
        `
    }
}