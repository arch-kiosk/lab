import {
    Dictionary,
    UISchemaError,
    UISchemaBaseUIElement,
    UISchemaLayoutElement, UISchemaUILevels, UISchemaElementOnLayout,
} from '../uischema'
import { html, TemplateResult } from 'lit'
import { createRef, Ref, ref } from 'lit/directives/ref.js'
import { UILayoutRenderContext } from '../uielementrendercontext'
import { UILayout } from './uilayout'
import '@arch-kiosk/virtualizerlab'
import {    VirtualScrollContainer } from "@arch-kiosk/virtualizerlab"
import {
    BufferedDataProvider,
    VirtualScrollContainerDataProvider,
} from '@arch-kiosk/appfoundation/dataprovider'
import { UIComponent } from '#src/uicomponent'
import { UIElementRenderer } from '#src/sharedtypes'

export class UIVirtualScrollLayout extends UILayout {
    cssClass = 'ui-virtual-scroll-layout'
    renderElementLabels = false
    subLayoutId: string
    public cardinality: "1" | "N" = "N"
    virtualLayoutRef: Ref<VirtualScrollContainer> = createRef()
    dataProvider?: VirtualScrollContainerDataProvider
    renderUIElement: UIElementRenderer
    renderContext?: UILayoutRenderContext

    constructor(
        id: string,
        reactiveControllerHost: UIComponent,
        layoutDefinition: UISchemaLayoutElement,
    ) {
        super(id, reactiveControllerHost, layoutDefinition)
        this.renderUIElement = reactiveControllerHost.renderElement.bind(reactiveControllerHost)
        this.subLayoutId = this.validateSchemaDefinition(id)
        if (reactiveControllerHost) {
            reactiveControllerHost.addController(this)
        }
    }

    private validateSchemaDefinition(id: string) {
        let uiElements: Dictionary<UISchemaBaseUIElement>
        // if (id === 'root') {
        //   uiElements = (reactiveControllerHost.getSchemaElement() as UISchema).root.element_type.ui_elements
        // } else {
        const layoutElement = this.layoutDefinition
        if (!layoutElement) {
            throw new UISchemaError(`layoutElement ${id} not in schema`)
        }
        uiElements = layoutElement.ui_elements
        // }
        if (!uiElements) {
            throw new UISchemaError(`layoutElement ${id} has no ui_elements`)
        }
        if (Object.keys(uiElements).length !== 1) {
            throw new UISchemaError(`layoutElement ${id} must have exactly one layout element`)
        }
        const subLayout = Object.values(uiElements)[0] as UISchemaLayoutElement
        if (subLayout.element_type !== 'layout') {
            throw new UISchemaError(
                `layoutElement ${id} must have exactly one layout element. The type ${subLayout.element_type} is not allowed.`,
            )
        }
        return Object.keys(uiElements)[0]
    }

    // @ts-ignore
    renderLayoutStyles(_?: UISchemaUIElementElementLayout): string {
        let style = ''
        return style
    }

    public renderLayout(
        layoutId: string,
        renderContext: UILayoutRenderContext,
        renderUIElement: UIElementRenderer,
    ): TemplateResult {
        console.log(`rendering VirtualScrollLayout ${this._id}`)
        let style: string = ''
        this.renderContext = renderContext
        const layoutDefinition = renderContext.elementDefinition as UISchemaElementOnLayout<"scroll">

        if (this.renderContext.parentLayout) {
            style = this.renderContext.parentLayout.renderLayoutStyles(renderContext.elementDefinition)
        }

        // This is only an emergency break to make sure the scroll layout always has a height.
        // It will be overridden by the height set in the schema definition

        let maxHeight = 'max-height: 100vh;'

        // The scroll layout is an exception to the rule right now: It interprets its own layout section. Normally that is
        // the job of the parent layout. But the ScrollLayout is not supposed to have a parent layout.
        if (layoutDefinition.layout?.max_height) {
            if (typeof (layoutDefinition.layout?.max_height) === 'string' ||
                typeof (layoutDefinition.layout?.max_height) === 'number') {
                maxHeight += `max-height: ${layoutDefinition.layout?.max_height}` + ';'
            }
        }
        style = maxHeight + style
        if (renderUIElement) {
            this.renderUIElement = renderUIElement
        }
        if (renderContext.elementDefinition.ui_level === undefined) {
            this.uilevel = renderContext.parentLayout?.uilevel ?? 0 as UISchemaUILevels
        }
        this.uilevel = renderContext.elementDefinition.ui_level ?? this.uilevel

        return html`
            <virtual-scroll-container ${ref(this.virtualLayoutRef)}
                                      id=${renderContext.getScopedId(layoutId)}
                                      ui-level=${"l"+this.uilevel}
                                      class=${this.cssClass}
                                      style=${style}>
            </virtual-scroll-container>
        `
    }

    hostUpdated() {
        console.log(`initializing VirtualScrollContainer ${this._id}`)
        const scrollContainer = this.virtualLayoutRef.value
        if (
            scrollContainer &&
            this.reactiveControllerHost.dataProvider &&
            this.reactiveControllerHost.dataProvider !== this.dataProvider
        ) {
            const layoutHeight = this.getSubLayoutHeight(scrollContainer, this.subLayoutId)
            if (layoutHeight) {
                scrollContainer.rowHeight = layoutHeight
            }
            this.dataProvider = this.reactiveControllerHost.dataProvider
            this.dataProvider.setNotifier((notification) => {
                if (this.dataProvider) {
                    console.log("telemetry", (this.dataProvider as BufferedDataProvider).getTelemetry())
                    scrollContainer.notifyDataReady(notification)
                }
            })
            console.log('Initializing scrollContainer')
            scrollContainer.init(
                this.dataProvider,
                (rowNr, _, record) => html`
                    <div style="height:100%;width:100%;border: 1px solid red">
                        ${this.reactiveControllerHost.renderElement(
                                this.subLayoutId,
                                this.reactiveControllerHost.getSchemaElement(
                                        this.subLayoutId,
                                ),
                                this, 
                                {
                                    recordIndex: rowNr,
                                    recordUID: record.uid,
                                    record: record
                                },
                        )}
                    </div>
                `,
            )
        } else {
            scrollContainer?.requestUpdate()
        }
    }

    protected parseCssCalc(expression: string, targetElement: HTMLElement = document.body): number {
        try {
            const tempEl = document.createElement('div')

            tempEl.style.position = 'absolute'
            tempEl.style.visibility = 'hidden'
            tempEl.style.pointerEvents = 'none'

            tempEl.style.height = `${expression}`

            targetElement.insertAdjacentElement('afterend', tempEl)

            const resolvedPx = window.getComputedStyle(tempEl).height

            tempEl.remove()
            return parseFloat(resolvedPx)
        } catch {}
        return -1
    }

    private getSubLayoutHeight(scrollContainer: VirtualScrollContainer, subLayoutId: string) {
        const subLayoutDefinition = this.reactiveControllerHost.getSchemaElement(subLayoutId) as UISchemaElementOnLayout<'scroll'>
        let layoutHeight = subLayoutDefinition.layout?.max_height
        if (layoutHeight !== undefined) {
            if (typeof (layoutHeight) === 'string') {
                layoutHeight = layoutHeight.trim()
                const numlayoutHeight = Number(layoutHeight)
                if (Number.isNaN(numlayoutHeight)) {
                    layoutHeight = this.parseCssCalc(layoutHeight, scrollContainer)
                    if ((layoutHeight <= 0)) layoutHeight = undefined
                } else {
                    layoutHeight = numlayoutHeight
                }
            } else {
                if (typeof (layoutHeight) !== 'number') layoutHeight = undefined
            }
        }
        return layoutHeight
    }
}
