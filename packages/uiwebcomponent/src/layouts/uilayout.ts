import {
    UISchemaDynamicUIElement,
    UISchemaElementOnLayout,
    UISchemaLayoutElement, UISchemaOrchestrationStrategyKeys,
} from '../uischema'
import { UIElementRenderContext, UILayoutRenderContext } from '../uielementrendercontext'
import { html, nothing, ReactiveController, TemplateResult } from 'lit'
import { UIComponent } from '#src/uicomponent'
import { TemplateResultOrNothing, UIElementRenderer } from '#src/sharedtypes'
import { UIElement } from '#src/uielement'

// @ts-ignore
export abstract class UILayout implements ReactiveController {
    layoutDefinition: UISchemaLayoutElement
    _id: string = '?'
    protected validation=false
    reactiveControllerHost: UIComponent
    abstract cssClass: string
    public renderElementLabels: boolean = true
    public abstract cardinality: "1" | "N"

    constructor(
        id: string,
        reactiveControllerHost: UIComponent,
        layoutDefinition: UISchemaLayoutElement,
        recordValidation = false
    ) {
        this._id = id
        this.reactiveControllerHost = reactiveControllerHost
        this.layoutDefinition = layoutDefinition
        this.validation = recordValidation
        console.log(`instantiating layout ${id}`)
    }


    abstract renderLayoutStyles(elementDefinition: UISchemaElementOnLayout<UISchemaOrchestrationStrategyKeys>, elementRenderContext?: unknown): string

    public adjustElementStyles<A>(elementRenderContext: A): A {
        return elementRenderContext
    }

    protected requestRerender(targetElement?: HTMLElement) {
        if (targetElement) {
            targetElement.dispatchEvent(
                new CustomEvent('rerender-request', {
                    bubbles: true,
                    composed: true, // Allows crossing Shadow DOM boundaries if needed
                })
            )
        } else {
            // Fallback to updating the master component if triggered outside a DOM context
            this.reactiveControllerHost?.requestUpdate()
        }
    }

    get defaultElementVisibility() {
        if (this.layoutDefinition.default_element_visibility == undefined) return true

        // if (this.layoutSettings.default_element_visibility instanceof Boolean)
        if (
            this.layoutDefinition.default_element_visibility === 'true' ||
            this.layoutDefinition.default_element_visibility == true
        )
            return true

        if (
            this.layoutDefinition.default_element_visibility === 'false' ||
            this.layoutDefinition.default_element_visibility == false
        )
            return false

        return this.layoutDefinition.default_element_visibility
    }

    public onKeyUp(event: KeyboardEvent) {
        console.log(event)
    }


    public dataChanged(event: InputEvent, recordIndex?:number) {
        // const element=this.reactiveControllerHost.getSchemaElement(elementId)
        const domElement = event.target as HTMLInputElement
        if (recordIndex !== undefined && domElement) {
            const elementId = this.reactiveControllerHost.unScopeId(domElement.id)
            if (elementId) {
                this.reactiveControllerHost.dataProvider?.dataChanged(recordIndex, elementId, domElement.value)
                this.requestRerender(domElement)
            }
        } else {
            console.log("no record index or dom element", recordIndex, domElement)
        }
        event.stopPropagation()
    }

    protected renderRecordValidation(_layoutId: string, renderContext: UILayoutRenderContext): unknown {
        const validationInfo = renderContext.uicomponent.dataProvider?.getRecordValidationInformation(renderContext.dataContext.recordIndex)
        return validationInfo && validationInfo.length > 0? html`
            <div style="position: absolute; right: 0; left: auto; background-color: lightcoral" class="layout-validation">${validationInfo.map((vi) => html`${vi.result as string}`)}</div>
        `:nothing
    }



    public renderLayout(
        layoutId: string,
        renderContext: UILayoutRenderContext,
        renderElement: UIElementRenderer,
    ): TemplateResultOrNothing{
        const layoutDefinition = renderContext.elementDefinition
        const v = UIElement.isVisible(renderContext, layoutId)
        console.log(`${layoutId} visible is ${v}`)
        if (!(v)) {
            return nothing
        }

        const cssClasses = UIElement.getCSSClasses(renderContext, layoutDefinition.style?.css_classes)
        const cssStyles = UIElement.getCSSStyles(renderContext, layoutDefinition.style?.css_styles)

        if (renderContext.parentLayout)
            renderContext.parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )

        const elements = this.getOrderedElements(renderContext.elementDefinition)
        let style: string = ''

        // This applies the parent layout styles to the layout element
        if (renderContext.parentLayout) style = renderContext.parentLayout.renderLayoutStyles(layoutDefinition)

        // style += (style ? ';' : '')
        // style += this.reactiveControllerHost.getPaddingStyle(renderContext.layoutDefinition.layout?.padding)
        const recordNr = renderContext.dataContext?renderContext.dataContext.recordIndex:undefined
        // if (recordNr) renderContext.uicomponent.dataProvider?.getRecord(recordNr, true)
        console.log(`rendering layout ${this._id} for record`,renderContext.dataContext.record)

        const renderedElements = elements.map((id) =>
            renderElement(id, renderContext.elementDefinition.ui_elements[id], this, renderContext.dataContext),
        )
        const recordUid = renderContext.dataContext?renderContext.dataContext.recordUID as string:undefined
        if (renderContext.parentLayout) {
            style = (style ? style + ";" : "") + renderContext.parentLayout.renderLayoutStyles(renderContext.elementDefinition, {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            })
            console.log(`rendering layout ${this._id} with styles`, (renderContext.elementDefinition as UISchemaElementOnLayout<UISchemaOrchestrationStrategyKeys>).layout)

        }
        return this.renderHtmlTemplate(
                recordNr,
                layoutId,
                renderContext,
                cssClasses,
                (style ? style + ";" : "") + Object.entries(cssStyles).map(([key, val]) => `${key}:${val}`).join(";"),
                recordUid,
                renderedElements)
    }

    protected renderHtmlTemplate(recordNr: number | undefined,
                                 layoutId: string,
                                 renderContext: UILayoutRenderContext,
                                 cssClasses: string[],
                                 style: string, recordUid: string | undefined,
                                 renderedElements: TemplateResultOrNothing[]) {
        return html`
            ${this.validation && recordNr !== undefined ? this.renderRecordValidation(layoutId, renderContext) : nothing}
            <div id="${renderContext.getScopedId(layoutId)}" class="${[this.cssClass, ...cssClasses].join(" ")}" 
                 style="${style}" 
                 data-record-nr="${recordNr ?? nothing}" 
                 data-record-uid="${recordUid ?? nothing}"
                 @input="${(event: InputEvent) => this.dataChanged(event, recordNr)}"
            >
            ${renderedElements}
            </div>
        `
    }

    renderElement<A>(
        elementDefinition: UISchemaElementOnLayout<UISchemaOrchestrationStrategyKeys>,
        elementRenderContext: A,
        elementRenderer:(context: A) => TemplateResult
    ): TemplateResult {
        return html`
            <div class="element-container" part="${elementDefinition.element_type}" style="${this.renderLayoutStyles(elementDefinition, elementRenderContext)}">${elementRenderer(elementRenderContext)}</div>
        `
    }

    protected devInfo(context: UIElementRenderContext, ...texts: Array<string | undefined>) {
        if (context.uicomponent.showDevelopmentInfo) {
            const ht: Array<TemplateResult> = []
            for (const t of texts) {
                ht.push(
                    html`<span class="developer-info"">[${t == undefined ? 'undefined' : t}]</span>`,
                )
            }
            return ht
        } else return html``
    }

    public renderLabel(context: UIElementRenderContext, id: string, text: string, errorState = false) {
        let elementDefinition = context.elementDefinition as UISchemaDynamicUIElement
        return this.renderElementLabels
            ? html`
                    <label for="${context.getScopedId(id)}"
                           style="${errorState ? 'color: red' : nothing}"
                    >${text ? text : nothing}
                        ${this.devInfo(
                            context,
                            elementDefinition.text,
                            elementDefinition.value,
                        )}
                    </label>
            `
            : this.devInfo(context, elementDefinition.text, elementDefinition.value)
    }


    public getOrderedElements(layoutSchema: UISchemaLayoutElement): Array<string> {
        try {
            if (layoutSchema.order) {
                const allElements = Object.keys(layoutSchema.ui_elements)
                allElements.sort()
                const orderedElements = [...layoutSchema.order]
                const result: Array<string> = []
                for (const orderedElementId of orderedElements) {
                    if (orderedElementId === '...') {
                        result.push('...')
                    } else {
                        let idx = allElements.findIndex((x) => x === orderedElementId)
                        if (idx > -1) {
                            result.push(allElements[idx])
                            allElements.splice(idx, 1)
                        }
                    }
                }

                let idxPlaceholder = result.findIndex((x) => x === '...')
                if (idxPlaceholder > -1) {
                    result.splice(idxPlaceholder, 1, ...allElements)
                }

                return result
            } else {
                const allElements = Object.keys(layoutSchema.ui_elements)
                allElements.sort()
                return allElements
            }
        } catch (e) {
            throw `UILayoutClass.getOrderedElements for layout ${this._id}: ${e as string}`
        }
    }
}

export abstract class UIListLayout extends UILayout {
    _sortOrder: Array<string> = []

    protected _initSorting(renderContext: UILayoutRenderContext) {
        if (renderContext.uicomponent && renderContext.uicomponent.setSortOrder) {
            let settings: UISchemaListLayoutSettings = renderContext.elementDefinition
                .layout_settings as UISchemaListLayoutSettings
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
