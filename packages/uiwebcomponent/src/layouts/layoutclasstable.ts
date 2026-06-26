import {UISchemaListLayoutSettings, UISchemaUIElement, UISchemaUIElementLayoutSettings} from "../uischema";
import {html, nothing, TemplateResult} from "lit";
import {UILayoutRenderContext} from "../uielementrendercontext";
import {UILayoutClass, UIListLayoutClass} from "./uilayoutclass";

export class UITableLayoutClass extends UIListLayoutClass {
    cssClass = "ui-table-layout"
    renderElementLabels = false

    // @ts-ignore
    renderLayoutStyles(layout?: UISchemaUIElementLayoutSettings): string {
        let style = ""
        return style
    }

    public headerClicked(event: MouseEvent) {
        const header = event.currentTarget as HTMLElement
        const id = header.dataset["id"]
        let orderIdx = this._sortOrder.findIndex((x) => x.startsWith(">")?x.slice(1)===id:x === id)
        let dec= false

        if (!id) return
        if (orderIdx > -1) {
            dec = this._sortOrder[orderIdx].startsWith(">")
            if (orderIdx == 0) {
                dec = !dec
            }
            if (orderIdx > 0) {
                this._sortOrder[orderIdx] = this._sortOrder[0]
            }
            this._sortOrder[0] = dec?">"+id:id
        } else {
            this._sortOrder.splice(0,0,id)
        }
        this.requestUpdate()
    }

    public renderSortButton(id: string) {
        const orderIndex = this._sortOrder.findIndex((x) => x.startsWith(">")?x.slice(1)===id:x === id)
        if (orderIndex > -1) {
            const order = this._sortOrder[orderIndex]
            const cssClass= orderIndex == 0?"table-header-icon":"table-header-icon-secondary"
            if (order.startsWith(">")) {
                return html`<span class="${cssClass}"><i></i></span>`
            } else {
                return html`<span class="${cssClass}"><i></i></span>`
            }
        }
        return nothing
    }
    public renderHeaders(renderContext: UILayoutRenderContext, elements: string[]) {
        const settings = renderContext.entry.layout_settings as UISchemaListLayoutSettings
        const orderAllowed = settings.allow_ordering_by || []
        const allAllowed = settings.allow_ordering_by == undefined
        console.log(orderAllowed)
        return html`
            <thead>
            <tr>
            ${elements.map((id) => html`
                <th class="table-header" 
                    style="${this.getTableHeaderStyle(renderContext.entry.ui_elements[id].layout)}"
                    data-id="${id}" @click="${allAllowed || orderAllowed.includes(id)?this.headerClicked.bind(this):nothing}">
                    ${this.renderSortButton(id)}
                    <span class="table-header-text">${renderContext.haulData(renderContext.entry.ui_elements[id].element_type.text)}</span>
                </th>
            `)}
            </tr>
            </thead>
        `
    }

    private getTableHeaderStyle(layout_settings: UISchemaUIElementLayoutSettings | undefined) {
        let style = ""
        if (layout_settings?.min_width) {
            if (String(layout_settings.min_width).indexOf("%") > -1)
                style = `width: ${layout_settings.min_width}`
        }
        return style;
    }

    public renderLayout(renderContext: UILayoutRenderContext, layouter: UILayoutClass, style: string,
                        renderElement: (id: string, entry: UISchemaUIElement, layouter: UILayoutClass) => TemplateResult): TemplateResult {
        const elements = this.getOrderedElements(renderContext.entry)

        const rows: TemplateResult[] = []
        renderContext.resetCursor()
        this._initSorting(renderContext)
        while (renderContext.next()) {
            rows.push(html`
                <tr id="R${renderContext.getCurrentUID()?renderContext.getCurrentUID():nothing}">
                    ${elements.map((id) => renderElement(id, renderContext.entry.ui_elements[id], layouter))}
                </tr>
            `)
        }

        return html`
            <table class="${this.cssClass}" style="${style}">
                ${this.renderHeaders(renderContext, elements)}
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `
    }


    renderElement(layout: UISchemaUIElementLayoutSettings|undefined, element: TemplateResult): TemplateResult {
        return html`
            <td class="text-cell" style="${this.renderLayoutStyles(layout)}">
                ${element}
            </td>
        `
    }
}
