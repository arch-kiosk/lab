import {
    UILayout,
    UISchemaLayoutSettings,
    UISchemaListLayoutSettings,
    UISchemaUIElement,
    UISchemaUIElementLayoutSettings
} from "../uischema";
import {UILayoutRenderContext} from "../uielementrendercontext";
import {html, TemplateResult} from "lit";

export abstract class UILayoutClass {
    layoutSettings?: UISchemaLayoutSettings
    _id: string = "?"
    abstract cssClass: string
    public renderElementLabels: boolean = true

    /**
     * onRequestUpdate needs a method assigned that is statically bound to the method's instance.
     * So something like
     * `layout.onRequestUpdate = this.updateRequested.bind(this)`
     */
    public onRequestUpdate: undefined | (() => void)

    constructor(id: string, layoutSettings?: UISchemaLayoutSettings) {
        this._id = id
        this.layoutSettings = layoutSettings
    }

    abstract renderLayoutStyles(layout?: UISchemaUIElementLayoutSettings): string;

    protected requestUpdate() {
        if (this.onRequestUpdate)
            this.onRequestUpdate()
    }

    get defaultElementVisibility () {
        if (this.layoutSettings?.default_element_visibility == undefined)
            return true

        // if (this.layoutSettings.default_element_visibility instanceof Boolean)
        if (this.layoutSettings.default_element_visibility === "true" || this.layoutSettings.default_element_visibility == true)
            return true

        if (this.layoutSettings.default_element_visibility === "false" || this.layoutSettings.default_element_visibility == false)
            return false

        return this.layoutSettings.default_element_visibility
    }

    public onKeyUp(event: KeyboardEvent) {
        console.log(event)
    }

    public renderLayout(renderContext: UILayoutRenderContext, layouter: UILayoutClass, style: string,
                        renderElement: (id: string, entry: UISchemaUIElement, layouter: UILayoutClass) => TemplateResult): TemplateResult {
        const layoutSchema = renderContext.entry as UILayout
        const elements = this.getOrderedElements(layoutSchema)
        const renderedElements = elements.map((id) => renderElement(id, layoutSchema.ui_elements[id], layouter))

        return html`
            <div class="${this.cssClass}" style="${style}"">
                ${renderedElements}
            </div>
        `
    }

    renderElement(layout: UISchemaUIElementLayoutSettings|undefined, element: TemplateResult): TemplateResult {
        return html`
            <div class="text-field-div" style="${this.renderLayoutStyles(layout)}">
                ${element}
            </div>
        `
    }

    public getOrderedElements(layoutSchema: UILayout): Array<string> {
        try {
            if (layoutSchema.layout_settings?.order) {
                const allElements = [...Object.keys(layoutSchema.ui_elements)]
                allElements.sort()
                const orderedElements = [...layoutSchema.layout_settings.order]
                const result: Array<string> = []
                for (const orderedElementId of orderedElements) {
                    if (orderedElementId === "...") {
                        result.push("...")
                    } else {
                        let idx = allElements.findIndex(x => x === orderedElementId)
                        if (idx > -1) {
                            result.push(allElements[idx])
                            allElements.splice(idx, 1)
                        }
                    }
                }

                let idxPlaceholder = result.findIndex(x => x === "...")
                if (idxPlaceholder > -1) {
                    result.splice(idxPlaceholder, 1, ...allElements)
                }

                return result;
            } else {
                const allElements = [...Object.keys(layoutSchema.ui_elements)]
                allElements.sort()
                return allElements
            }
        } catch (e) {
            throw `UILayoutClass.getOrderedElements for layout ${this._id}: ${e}`
        }
    }


}

export abstract class UIListLayoutClass extends UILayoutClass{
    _sortOrder: Array<string> = []

    protected _initSorting(renderContext: UILayoutRenderContext) {
        if (renderContext.uicomponent && renderContext.uicomponent.setSortOrder) {
            let settings: UISchemaListLayoutSettings = renderContext.entry.layout_settings as UISchemaListLayoutSettings
            if (settings) {
                if (this._sortOrder.length == 0) {
                    this._sortOrder = settings.order_records_by || []
                }
            }
            if (this._sortOrder.length > 0) {
                renderContext.uicomponent.setSortOrder(this._sortOrder)
            }
        }
    }
}