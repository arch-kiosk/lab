'use strict'
import { unsafeCSS, LitElement, TemplateResult, PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { customElement, property, state } from 'lit/decorators.js'
import bootPluginManager from './boot'
import './layouts/uirenderboundary'
// @ts-ignore
import local_css from './styles/ui-component.sass?inline'
import { UIConfigurableElementFactory } from './uielementfactory'
import { I18NMock } from './i18nsimpleprovider'
import {
    Dictionary,
    UISchemaError,
    UISchema,
    UISchemaLayoutElement,
    UISchemaUIElements, UISchemaProcessor,
} from './uischema'

import {
    UIComponentDataProvider,
    UIComponentTimeZoneInfoProvider,
    UIInputData,
    UIElementWithId, UIComponenti18NTCallback, TemplateResultOrNothing,
} from './sharedtypes'

export type { UIComponentDataProvider, UIComponentTimeZoneInfoProvider } from './sharedtypes'

import {
    RenderContextDataContext,
    UIElementRenderContext,
    UILayoutRenderContext,
} from './uielementrendercontext'
import { type AppContext, type EventCatalog } from '#src/apptypes'
import { PluginManager } from '@arch-kiosk/appfoundation'
import { UIVirtualScrollLayout } from './layouts/virtualscrolllayout'
import { UILayout } from '#src/layouts/uilayout'
import { UIColumnLayoutClass } from '#src/layouts/layoutclasscolumn'
import { UIRenderBoundary } from '#src/layouts/uirenderboundary'

export type * from './uischema'

@customElement('ui-component')
export class UIComponent extends LitElement {
    /** @ignore */
    static styles = unsafeCSS(local_css)
    _messages: { [key: string]: object } = {}
    bindingToElementList: Dictionary<UIElementWithId> = {}
    flatElementList: Dictionary<UISchemaUIElements> = {}
    layouts: Dictionary<UILayout> = {}
    schemaProcessor?: UISchemaProcessor
    public interpretedExpressionPrefix = ''
    // _element_list: { [key: string]: UISchemaUIElement } = {}
    // _selection_data: { [key: string]: { [key: string]: string } } = {}


    @state()
    private pluginManager?: PluginManager<AppContext, EventCatalog>

    // changed this to @state and private for typedoc. I don't think the factory should be set from the outside.
    @state()
    private uiElementFactory?: UIConfigurableElementFactory

    /** for debugging purposes
    * adds i18N keys to the error messages if no external i18N provider is assigned */
    @property()
    reportErrorKeys: boolean = false

    @property()
    uiSchema: UISchema | null = null

    @property()
    dataProvider: UIComponentDataProvider | null = null

    @property()
    i18NTProvider?: UIComponenti18NTCallback

    @property({ type: String, attribute: 'current-locale' })
    currentLocale: string = ""

    @property({ type: String, attribute: 'override-css' })
    overrideCss: string = ''

    /* Note: Lit has nothing to do with instanceSheet! When instanceSheet is updated via replaceSync,
    the Browser applies the changes immediately/*
     */
    private instanceSheet = new CSSStyleSheet()

    @property()
    linkIdentifiers: boolean = true

    @property()
    showDevelopmentInfo: boolean = false

    @property()
    data: UIInputData = {}

    @property()
    timeZoneInfoProvider: UIComponentTimeZoneInfoProvider | null = null

    @state()
    _showError: string | null = null

    constructor() {
        super()
        this._messages = {}
    }

    override async connectedCallback() {
        console.info(`connectedCallback called`)
        super.connectedCallback()
        this.addEventListener('rerender-request', this.onRerenderRequest)

        try {
            this.pluginManager = await bootPluginManager()
            console.info(`plugin Manager has booted!`)
        } catch (e) {
            console.error(`ui-component could not boot the PluginManager: ${e as string}`)
        }
    }

    override disconnectedCallback() {
        super.disconnectedCallback()
        this.removeEventListener('rerender-request', this.onRerenderRequest)
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        // super.willUpdate(_changedProperties);
        if ((_changedProperties.has('uiSchema') || _changedProperties.has('currentLocale')) && this.uiSchema) {
            this.flatElementList = {}
            this.bindingToElementList = {}
            this.schemaProcessor = new UISchemaProcessor(this.uiSchema)
            this._showError = this.schemaProcessor.processSchemaDefinition(this)
            if (!this._showError) {
                this.flatElementList = this.schemaProcessor.flatElementList
                this.bindingToElementList = this.schemaProcessor.bindingToElementList
            }
        }
    }

    public scopeId(id: string, recordIndex?: number) {
        return id + (recordIndex !== undefined && recordIndex > -1 ? `_R${recordIndex}` : '')
    }

    public unScopeId(scopedId: string) {
        const last_R_index = scopedId.lastIndexOf('_R')
        return last_R_index === -1 ? scopedId : scopedId.substring(0, last_R_index)
    }

    protected keyupOnElement = (e: KeyboardEvent) => {
        throw Error('keyupOnElement not implemented')
        // if (e.key === "Enter" && this._default?.["ENTER"]) {
        //   this.fieldChangedById(this._default?.["ENTER"])
        // } else {
        //   if (e.key === "Escape" && this._default?.["CANCEL"]) {
        //     this.fieldChangedById(this._default?.["CANCEL"])
        //   }
        // }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        if (this.shadowRoot) {
            this.shadowRoot.adoptedStyleSheets = [
                ...this.shadowRoot.adoptedStyleSheets,
                this.instanceSheet,
            ]
        }
    }

    // protected firstUpdated(_changedProperties: PropertyValueMap<unknown>) {
    //   super.firstUpdated(_changedProperties)
    //
    //   for (const comboBox of this.renderRoot.querySelectorAll("vaadin-combo-box")) {
    //     if (comboBox && !comboBox.items && this.lookupProvider) {
    //       let lookupProvider = this.lookupProvider
    //       let element = this.getSchemaElement(comboBox.id)
    //       if (element.element_type.name.toLowerCase() !== "selection") continue
    //       const selectionElement = <UISchemaComboBox>element.element_type
    //
    //       // if this is a selection with a static list, no dataProvider is necessary
    //       if (Array.isArray(selectionElement.items)) continue
    //
    //       //Todo: This should be in the uielementcombobox.ts
    //       comboBox.dataProvider = async (params, callback) => {
    //         if (!(comboBox.id in this._selection_data)) {
    //           console.log("looking up", params)
    //           lookupProvider(
    //             comboBox.id,
    //             <UISchemaLookupSettings>selectionElement.items,
    //             params,
    //             (items, size?: number) => {
    //               //this is a finite list: The callback gets all items at once.
    //               //item[1] is the display value, item[0] is the data value of the selection
    //               const valuesOnly = []
    //               this._selection_data[comboBox.id] = {}
    //
    //               for (const item of items) {
    //                 this._selection_data[comboBox.id][item[1]] = item[0]
    //                 valuesOnly.push(item[1])
    //               }
    //               callback(valuesOnly, size)
    //             },
    //           )
    //         } else {
    //           const values = Object.entries(this._selection_data[comboBox.id])
    //             .map((x) => x[0])
    //             .filter((v) => v.startsWith(params.filter))
    //           callback(values, values.length)
    //         }
    //       }
    //     }
    //   }
    // }

    updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties)
        if (_changedProperties.has('overrideCss')) {
            this.instanceSheet.replaceSync(this.overrideCss || '')
        }
    }

    // protected getSchemaElement(id: string) {
    //   return this._element_list[id]
    // }

    public i18NST(key: string, defaultValue:string, values: string[], escapeValues=false) {
        const options: Record<string, unknown> & {defaultValue: string} = {defaultValue: defaultValue}

        defaultValue.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g).forEach((match, index) => {
            const paramName = match[1];
            options[paramName] = values[index];
        });
        return this.i18NT(key, options, escapeValues)
    }

    public i18NT(key: string, options:Record<string,unknown> & {defaultValue: string}, escapeValues=false) : string {
        if (!escapeValues) {
            options["interpolation"] = {"escapeValue": false}
        }
        if (this.i18NTProvider) return this.i18NTProvider(key, options)
        return I18NMock.t(key,options, this.reportErrorKeys)
    }

    public gotoRecord(uid: string) {
        throw Error('gotoRecord not implemented')
        // try {
        //   let el = this.shadowRoot?.querySelector(`#R${uid}`)
        //   if (el) {
        //     // (<HTMLElement>el).style.border = "1px solid red"
        //     console.log(`gotoRecord found`, el)
        //     el.scrollIntoView()
        //     this.dispatchEvent(
        //       new CustomEvent("scrolled-into-view", {
        //         detail: {
        //           element: el,
        //         },
        //         composed: true,
        //         bubbles: true,
        //       }),
        //     )
        //     console.log("scrolled-into-view triggered for ", el)
        //     return true
        //   } else {
        //     console.error(`uicomponent.gotoRecord: #R${uid} not found.`)
        //   }
        // } catch (e) {
        //   console.error(`uicomponent.gotoRecord: #R${uid} error`, e)
        // }
        // return false
    }

    public getSchemaElement(id: string) {
        // if (!id || id === "root") return this.uiSchema
        return this.flatElementList[id]
    }

    // private registerDefault(id: string, entry: UISchemaUIElement) {
    //   console.log(`default for ${entry.element_type.name} ${id} is ${entry.element_type.default}`)
    //   if (entry.element_type?.default) {
    //     this._default[entry.element_type.default] = id
    //   }
    // }

    protected gatherData() {
        throw Error('gatherData not implemented')
        // const result: { [key: string]: unknown } = {}
        // if (!this._dsd_to_element_list || Object.keys(this._dsd_to_element_list).length === 0) return {}
        // Object.entries(this._dsd_to_element_list).map(([dsd_field, element_entry]) => {
        //   result[dsd_field] = this.get_field_value(element_entry.id, element_entry.element)
        // })
        // return result
    }

    // protected get_field_value(id: string, element: UISchemaUIElement) {
    //   const domElement: HTMLFormElement | null = this.renderRoot.querySelector(`#${id}`)
    //   switch (element.element_type.name.toLowerCase()) {
    //     case "selection":
    //       return this.getSelectionValue(id, domElement, element.element_type as UISchemaComboBox)
    //     case "bool":
    //       return !!domElement?.checked
    //     default:
    //       return domElement?.value ? domElement?.value : ""
    //   }
    // }

    // //Todo: This should be in the uielementcombobox.ts
    // protected getSelectionValue(id: string, domElement: HTMLFormElement | null, comboBox: UISchemaComboBox) {
    //   let displayValue = domElement?.value ? domElement?.value : ""
    //   let dataValue: unknown
    //   // this._element_list[id].element_type;
    //   if (Array.isArray(comboBox.items) && comboBox.items.length > 0) {
    //     if (Array.isArray(comboBox.items[0])) {
    //       for (const item of comboBox.items) {
    //         if (item[1] === displayValue) {
    //           dataValue = item[0]
    //           break
    //         }
    //       }
    //     } else {
    //       dataValue = displayValue
    //     }
    //   } else {
    //     dataValue = domElement?.getAttribute("data-value")
    //     if (displayValue) {
    //       if (id in this._selection_data) {
    //         try {
    //           dataValue = this._selection_data[id][displayValue]
    //         } catch {}
    //       }
    //     }
    //   }
    //   return dataValue ? dataValue : ""
    // }

    protected fieldChangedById(id: string) {
        throw Error('fieldChangedById not implemented')
        // const options = {
        //   detail: {
        //     srcElement: id,
        //     newData: this.gatherData(),
        //   },
        //   bubbles: true,
        // }
        // this.dispatchEvent(new CustomEvent("dataChanged", options))
    }

    protected fieldChanged = (e: Event) => {
        if ('currentTarget' in e) {
            const id = (<HTMLElement>e.currentTarget).id
            this.fieldChangedById(id)
        }
    }

    // protected comboBoxFilterChanged = (e: ComboBoxFilterChangedEvent) => {
    //   throw Error("comboBoxFilterChanged not implemented")
    //   // const filter = e.detail.value.toLowerCase()
    //   // const comboBox = e.currentTarget as ComboBox
    //   // if (comboBox) {
    //   //   if (filter === "") {
    //   //     comboBox.filteredItems = undefined
    //   //   }
    //   //   let filteredItems = this._selection_data[comboBox.id]
    //   //   if (filteredItems) {
    //   //     let filteredItemsList = Object.keys(filteredItems).filter((v) =>
    //   //       v.toLowerCase().startsWith(filter),
    //   //     )
    //   //     comboBox.filteredItems = filteredItemsList
    //   //   }
    //   // }
    // }

    private getLayout(
        layoutElementId: string,
        layoutSchema: UISchemaLayoutElement,
        inheritReadOnly = false,
        cardinality = '1',
        parentCardinality?: '1' | 'N',
    ): UILayout {
        if (this.layouts.hasOwnProperty(layoutElementId)) {
            return this.layouts[layoutElementId]
        }
        let newLayout: UILayout

        if (inheritReadOnly) {
            layoutSchema.readonly = inheritReadOnly
        }

        if (layoutSchema.orchestration_strategy) {
            if (cardinality === '1') {
                const doValidation = Boolean(parentCardinality && parentCardinality === 'N')
                switch (layoutSchema.orchestration_strategy.toLowerCase()) {
                    case 'columns':
                        newLayout = new UIColumnLayoutClass(layoutElementId, this, layoutSchema, doValidation)
                        break
                    // case "rightalign":
                    //   return new UIRightAlignLayoutClass(layoutElementId, layoutSettings)
                    // case "stack":
                    //   return new UIStackLayoutClass(layoutElementId, layoutSettings)
                    default:
                        throw new UISchemaError(
                            this.i18NT("uic.render-layout-error-unspecific",
                                {defaultValue: 'Totally unknown orchestration strategy {{orchestration_strategy}}',
                                    orchestration_strategy: layoutSchema.orchestration_strategy})
                        )
                }
            } else if (cardinality === 'N') {
                if (layoutElementId !== 'root') {
                    //i18N: this is a comment for the translator
                    const msg= this.i18NST(
                        "uic.layout-error-N-cardinality-only-root",
                        'Layouts for N cardinality are only allowed as root layouts. Layout {{layoutElementId}} is not root. This must be a programming error.', [layoutElementId])

                    throw new UISchemaError(msg)
                }
                switch (layoutSchema.orchestration_strategy) {
                    // case "columns":
                    //   return new UIColumnLayoutClass(layoutElementId, layoutSettings)
                    // case "table":
                    //   return new UITableLayoutClass(layoutElementId, layoutSettings)
                    // case "gallery":
                    //   return new UIGalleryLayoutClass(layoutElementId, layoutSettings)
                    case 'scroll':
                        newLayout = new UIVirtualScrollLayout(layoutElementId, this, layoutSchema)
                        break
                    default:
                        throw new UISchemaError(
                            this.i18NST("uic.layout-error-unknown-orchestration-strategy", `Unknown orchestration strategy {{orchestration_strategy}} in layout {{layoutElementId}}`,
                                [layoutSchema.orchestration_strategy, layoutElementId])
                        )
                }
            } else {
                if (cardinality) {
                    throw new UISchemaError(
                        this.i18NST("uic.layout-error-unknown-cardinality", `Unknown cardinality {{cardinality}} for layout {{layoutElementId}}`,
                            [cardinality as string, layoutElementId])
                    )
                } else {
                    throw new UISchemaError(this.i18NST("uic.layout-error-no-cardinality", `no cardinality for layout {{layoutElementId}}`,
                        [layoutElementId]))
                }
            }
        } else {
            throw new UISchemaError(this.i18NST("uic.layout-error-no-orchestration-strategy", `no orchestration strategy for layout {{layoutElementId}}`,
                [layoutElementId]))
        }
        if (newLayout) {
            this.layouts[layoutElementId] = newLayout
            return newLayout
        } else {
            throw new UISchemaError(this.i18NST("uic.layout-unspecific-creation-error",`can't create layout {{layoutElementId}}`,
                [layoutElementId]))
        }
    }

    public getUIElementClass(elementType: string) {
        if (!this.uiElementFactory) {
            this.uiElementFactory = new UIConfigurableElementFactory()
            this.pluginManager?.fireSynchronously('registerUIElements', this.uiElementFactory)
        }
        return this.uiElementFactory.getUIElementClass(
            elementType,
        )
    }

    /**
     *
     * @param id the id here is the id of the element in the element tree of the ui definition! It is not a unique id within the html document.
     * @param elementDefinition
     * @param parentLayout
     */
    private renderUIElement(
        id: string,
        elementDefinition: UISchemaUIElements,
        parentLayout: UILayout,
        dataContext: RenderContextDataContext,
    ) {
        try {
            const renderContext = new UIElementRenderContext(this, elementDefinition, dataContext, parentLayout)
            const uiElementClass = this.getUIElementClass(elementDefinition.element_type)
            if ('binding' in renderContext.elementDefinition) {
                renderContext.elementDefinition.readonly =
                    renderContext.elementDefinition.readonly ||
                    parentLayout?.layoutDefinition?.readonly
            }
            return uiElementClass.render(renderContext, id)
        } catch (e) {
            console.error(`Exception in UIComponent.renderUIElement: ${e as string}`)
            return html`
                <div style="border: 2px dashed red">${elementDefinition.element_type} "${id}":
                    ${e}
                </div>`
        }
    }

    public renderElement(
        id: string,
        elementDefinition: UISchemaUIElements,
        parentLayout: UILayout,
        dataContext: RenderContextDataContext,
    ) {
        switch (elementDefinition.element_type) {
            case 'layout':
                return this.renderLayoutElement(id, elementDefinition, parentLayout, dataContext)
            default:
                return this.renderUIElement(id, elementDefinition, parentLayout, dataContext)
        }
    }


    private onRerenderRequest = (event: Event) => {
        const uiRenderBoundary: UIRenderBoundary = event.currentTarget as UIRenderBoundary
        if (uiRenderBoundary && uiRenderBoundary.tagName === 'UI-RENDER-BOUNDARY') {
            uiRenderBoundary.requestUpdate()
        } else {
            this.requestUpdate()
        }
        event.stopPropagation()
    }

    private renderLayoutElement(
        id: string,
        layoutDefinition: UISchemaLayoutElement,
        parentLayout: UILayout,
        dataContext: RenderContextDataContext,
    ): TemplateResult {
        let elementLayout
        try {
            elementLayout = this.getLayout(
                id,
                layoutDefinition,
                parentLayout.layoutDefinition.readonly, undefined,
                parentLayout.cardinality,
            )

        } catch (e) {
            return html`${this.i18NT("uic.render-layout-error-unspecific", {defaultValue: 'An error occurred when rendering the layout {{id}}: {{error}}', id: id, error: (e as Error).message ?? String(e)})}`
        }

        // const layoutType: string = entry.layout_settings?.type || "sheet"

        const layoutRenderContext = new UILayoutRenderContext(this, layoutDefinition, dataContext, parentLayout)
// Wrap the render output inside a boundary component
        return html`
            <ui-render-boundary @rerender-request="${this.onRerenderRequest}"
                                .renderContent=${() => elementLayout.renderLayout(
                                        id,
                                        layoutRenderContext,
                                        this.renderElement.bind(this))
                                }>
            </ui-render-boundary>
        `
    }

    private hideDevelopmentInfo = () => {
        this.renderRoot
            .querySelectorAll('.developer-info')
            .forEach((e) => ((e as HTMLElement).style.display = 'none'))
    }

    public gotoIdentifier = (event: PointerEvent) => {
        const detail = {
            identifier: (event.currentTarget as HTMLElement).dataset.identifier,
            fieldId: (event.currentTarget as HTMLElement).id,
        }
        const gotoEvent = new CustomEvent('goto-identifier', {
            detail,
            bubbles: false,
            composed: true,
            cancelable: false,
        })
        this.dispatchEvent(gotoEvent)
    }

    protected renderRootLayout(layout: UILayout) {
        //todo: There must be a proper datacontext here for the root layout:
        // The root layout could simply be a "1" type and connect to the current record of the dataprovider
        const layoutRenderContext = new UILayoutRenderContext(this, layout.layoutDefinition, { recordIndex: this.dataProvider?.getActiveRecordIndex() ?? -1 }, undefined)

        return layout.renderLayout('root', layoutRenderContext, this.renderElement.bind(this))
    }

    protected renderBootSpinner() {
        return html`
            <div>...</div>`
    }

    protected render() {
        console.log(`ui component ${this.id} rerender with language ${this.currentLocale}`)
        // noinspection JSMismatchedCollectionQueryUpdate
        const itemTemplates: TemplateResultOrNothing[] = []
        let rootLayout
        if (this.showDevelopmentInfo) {
            itemTemplates.push(html`
                <div
                        class="uicomponent-version"
                        @click="${this.hideDevelopmentInfo}"
                >
                    ${html`${import.meta.env.PACKAGE_VERSION}`}
                </div>`)
        }
        if (!this.pluginManager || !this.uiSchema) {
            itemTemplates.push(this.renderBootSpinner())
        } else {
            try {
                rootLayout = this.getLayout(
                    'root',
                    this.uiSchema.root,
                    false,
                    this.uiSchema.data_binding.cardinality,
                )
            } catch (e) {
                this._showError += `\n${this.i18NT("uic.error-init-root-layout", {defaultValue: 'Cannot initialize root Layout: {{error}}', error: (e as Error).message ?? String(e)})}`
            }
            if (!this._showError) {
                try {
                    if (this.uiSchema && rootLayout && this.dataProvider) {
                        itemTemplates.push(this.renderRootLayout(rootLayout))
                    } else {
                        itemTemplates.push(this.renderBootSpinner())
                    }
                } catch (e) {
                    this._showError += `\n${this.i18NT("uic.unspecific-render-error", {defaultValue: 'An error occurred when rendering this component:{{error}}', error: (e as Error).message ?? String(e)})}`
                }
            }
        }

        if (this._showError) {
            console.log(this._showError)
            itemTemplates.push(html`
                <div
                        style="user-select: text; background-color: var(--col-bg-alert); color: var(--col-primary-bg-alert); padding: .5em; font-family: monospace;white-space: pre-line;"
                >
                    ${this._showError}
                </div>`)
        }

        return html`${itemTemplates}`
    }
}
