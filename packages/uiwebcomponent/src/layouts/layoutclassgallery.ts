import {UISchemaListLayoutSettings, UISchemaUIElement, UISchemaUIElementLayoutSettings} from "../uischema";
import {html, nothing, TemplateResult} from "lit";
import {UILayoutRenderContext} from "../uielementrendercontext";
import {UILayoutClass, UIListLayoutClass} from "./uilayoutclass";

export class UIGalleryLayoutClass extends UIListLayoutClass {
    cssClass = "ui-gallery-layout"
    renderElementLabels = false
    _sortOrder: Array<string> = []

    // @state()
    selectedItem: string | undefined;

    // @ts-ignore
    renderLayoutStyles(layout?: UISchemaUIElementLayoutSettings): string {
        let style = ""
        return style
    }

    public itemClicked(e: MouseEvent) {
        // todo: refactor
        // this is a super hacky solution because it undermines the declarative architecture
        // but because right now there is no "store" that all elements could use
        // this is the best I can think of right now.

        if (e.target instanceof HTMLElement) {
            if (e.target.tagName === "FILE-VIEW") {
                e.stopPropagation()
                let parent: HTMLElement | null = e.target.parentElement
                let gallery: HTMLElement |undefined = undefined
                let selectedItem: HTMLElement |undefined = undefined
                while (parent) {
                   if (parent.classList.contains("gallery-item")) selectedItem = parent;
                   if (parent.classList.contains("ui-gallery-layout")) {
                       gallery = parent;
                       break;
                   }
                   if (parent.tagName === "ui-component") {
                       parent = null
                   } else {
                       parent = parent.parentElement
                   }
                }
                if (selectedItem && gallery)  {
                    let elements = gallery.querySelectorAll(".gallery-item-selected")
                    elements.forEach(e => {console.log(e); e.classList.remove("gallery-item-selected")})
                    selectedItem.classList.add("gallery-item-selected")
                }
            }
        }
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

    public renderSortButton(renderContext: UILayoutRenderContext, id: string, allAllowed: boolean, orderAllowed: string[]) {
        const orderIndex = this._sortOrder.findIndex((x) => x.startsWith(">")?x.slice(1)===id:x === id)
        if (orderIndex > -1) {
            const order = this._sortOrder[orderIndex]
            const cssClass= orderIndex == 0?"table-header-icon":"table-header-icon-secondary"

            return html`
                <div class="table-header"
                    style="${this.getTableHeaderStyle(renderContext.entry.ui_elements[id].layout)}"
                    data-id="${id}" @click="${allAllowed || orderAllowed.includes(id)?this.headerClicked.bind(this):nothing}">
                    ${order.startsWith(">")?html`<span class="${cssClass}"><i></i></span>`:html`<span class="${cssClass}"><i></i></span>`}
                    <span class="table-header-text">${renderContext.haulData(renderContext.entry.ui_elements[id].element_type.text)}</span>
                </div>`
        }
        return nothing
    }

    public renderHeaders(renderContext: UILayoutRenderContext, elements: string[]) {
        const settings = renderContext.entry.layout_settings as UISchemaListLayoutSettings
        const orderAllowed = settings.allow_ordering_by || []
        const allAllowed = settings.allow_ordering_by == undefined
        return html`
            <div class="gallery-headers">
            ${elements.map((id) => this.renderSortButton(renderContext, id, allAllowed, orderAllowed))}
            </div>
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

        const items: TemplateResult[] = []
        renderContext.resetCursor()
        this._initSorting(renderContext)
        while (renderContext.next()) {
            items.push(html`
                <div id="R${renderContext.getCurrentUID()?renderContext.getCurrentUID():nothing}" class="gallery-item " @click="${this.itemClicked}">
                    ${elements.map((id) => renderElement(id, renderContext.entry.ui_elements[id], layouter))}
                </div>
            `)
        }

        return html`
            ${this.renderHeaders(renderContext, elements)}
            <div class="${this.cssClass}" style="${style}">
                ${items}
            </div>
        `
    }


    renderElement(layout: UISchemaUIElementLayoutSettings|undefined, element: TemplateResult): TemplateResult {
        return html`
            <div class="gallery-sub-item" style="${this.renderLayoutStyles(layout)}">
                ${element}
            </div>
        `
    }
}
