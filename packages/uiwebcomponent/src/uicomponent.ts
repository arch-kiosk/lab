'use strict'
import Ajv from 'ajv';
import { unsafeCSS, LitElement, TemplateResult, PropertyValues } from 'lit'
import { html } from 'lit/static-html.js'
import { customElement, property, state } from 'lit/decorators.js'
import bootPluginManager from './boot'
import './layouts/uirenderboundary'
// @ts-ignore
import local_css from './styles/ui-component.sass?inline'
import { UIConfigurableElementFactory } from './uielementfactory'
import schemaArtifact from './jsonschema/uischemav2.json'
// import betterAjvErrors from 'better-ajv-errors';

import {
    Dictionary,
    UISchemaError,
    UISchema,
    UISchemaLayoutElement,
    UISchemaLayoutPadding,
    UISchemaUIElements,
} from './uischema'

import {
    UIComponentDataProvider,
    UIComponentTimeZoneInfoProvider,
    UIInputData,
    UIElementWithId
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
    ajv = new Ajv({
        allErrors: true,
        discriminator: true, // Enables strict tagged-union evaluation on @discriminator fields
    })
    validateFn = this.ajv.compile(schemaArtifact);
    // _element_list: { [key: string]: UISchemaUIElement } = {}
    // _selection_data: { [key: string]: { [key: string]: string } } = {}

    @state()
    private pluginManager?: PluginManager<AppContext, EventCatalog>

    // changed this to @state and private for typedoc. I don't think the factory should be set from the outside.
    @state()
    private uiElementFactory?: UIConfigurableElementFactory

    @property()
    uiSchema: UISchema | null = null

    @property()
    dataProvider: UIComponentDataProvider | null = null

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
        if (_changedProperties.has('uiSchema') && this.uiSchema) {
            this.processSchemaDefinition()
        }
    }

    public scopeId(id: string, recordIndex?: number) {
        return id + (recordIndex !== undefined && recordIndex >-1 ? `_R${recordIndex}` : "")
    }

    public unScopeId(scopedId:string) {
        const last_R_index = scopedId.lastIndexOf("_R");
        return last_R_index === -1 ? scopedId : scopedId.substring(0, last_R_index);
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

    // updated(_changedProperties: PropertyValueMap<unknown>) {
    //   super.updated(_changedProperties)
    // }

    // protected getSchemaElement(id: string) {
    //   return this._element_list[id]
    // }

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

    protected checkSchemaDefinitionBasics(): Array<string> {
        const errors: Array<string> = []
        if (!this.uiSchema!.data_binding?.cardinality) {
            errors.push(`The schema definition is not defining data_binding.cardinality. `)
        }
        if (!this.uiSchema?.root) {
            console.log(`No root element`)
            errors.push(`There is an error in the schema definition: There is no root element`)
        } else {
            if (this.uiSchema.root.element_type !== 'layout') {
                console.log(`the root element must be of type layout.`)
                errors.push(
                    `There is an error in the schema definition: the root element must have element_type "layout"`,
                )
            } else {
                if (!this.uiSchema.root.orchestration_strategy) {
                    console.error(
                        'The schema definition is not defining an orchestration_strategy',
                        this.uiSchema.root,
                    )
                    errors.push(`The schema definition is not defining an orchestration_strategy`)
                }
                if (!this.uiSchema.root.ui_elements) {
                    errors.push(
                        `The schema definition is not defining any ui_elements in the root layout`,
                    )
                }
            }
        }
        return errors
    }

    protected processSchemaDefinition() {
        const processSchemaDefinitionElement = (id: string, uiElement: UISchemaUIElements) => {
            const regex = new RegExp('^[a-z][a-z0-9\\-_]*$', 'gmi')
            if (!id.match(regex)) {
                errors.push(
                    `There is an error in the schema definition: the element id "${id}" is illegal. It must start with a letter followed by only letters and numbers. Element skipped.`,
                )
                return
            }
            if (id in this.flatElementList) {
                errors.push(
                    `There is an error in the schema definition: the element id "${id}" is used more than once in the UI schema. Skipped.`,
                )
                return
            }
            if (Object.keys(uiElement).length == 0 || !Object.hasOwn(uiElement, 'element_type')) {
                errors.push(`ui-component: Element id ${id} lacks "element_type": skipped.`)
                return
            }

            if ('binding' in uiElement) {
                const fieldName = uiElement.binding?.field_name.toLowerCase()
                if (fieldName) {
                    if (fieldName in this.bindingToElementList) {
                        console.log(
                            `duplicate binding to ${fieldName} bound again in element ${id} in UI schema`,
                        )
                        errors.push(
                            `There is an error in the schema definition: dsd field "${fieldName}" bound again in element "${id}" in UI schema`,
                        )
                        return
                    }
                    this.bindingToElementList[fieldName] = { id: id, element: uiElement }
                }
            }
            uiElement.enabled = uiElement.enabled ?? true
            this.flatElementList[id] = uiElement
            if (uiElement.element_type === 'layout') {
                for (const [id, childElement] of Object.entries(
                    (uiElement as UISchemaLayoutElement).ui_elements,
                )) {
                    processSchemaDefinitionElement(id, childElement)
                }
            }
        }

        /* main function body */
        let errors: Array<unknown> =[]
        let warnings: Array<string> = []
        try {
            console.log(`Validating Schema Definition`)
            this.validateSchema()
            console.log(`Processing Schema Definition`, this.uiSchema)
            this.bindingToElementList = {}
            this.flatElementList = {}
            errors = this.checkSchemaDefinitionBasics()
        } catch(e) {
            errors.push(`Cannot validate or process schema definition: ${e as string}`)
            console.error(`Cannot validate or process schema definition`,e)
        }
        if (errors.length === 0) {
            processSchemaDefinitionElement('root', this.uiSchema!.root)
        }
        this._showError = errors.length ? errors.join('\n') + warnings.join('\n') : ''
    }

    public validateSchema() {
        const valid = this.validateFn(this.uiSchema);
        if (!valid) {
            const rawErrors = this.validateFn.errors || [];

            // 1. Filter out internal structural noise from conditional (if/then/allOf) schemas
            const targetErrors = rawErrors.filter(
                (e) => !['if', 'then', 'else', 'allOf', 'anyOf', 'oneOf'].includes(e.keyword)
            );

            // 2. Map AJV errors into detailed, contextual strings
            const formattedMessages = targetErrors.map((e) => {
                const path = e.instancePath || '/root';

                switch (e.keyword) {
                    case 'const': {
                        const expected = JSON.stringify(e.params.allowedValue);
                        return `${path}: must be equal to constant ${expected}`;
                    }
                    case 'enum': {
                        const allowed = (e.params.allowedValues as unknown[])
                            .map((v) => JSON.stringify(v))
                            .join(', ');
                        return `${path}: must be one of [${allowed}]`;
                    }
                    case 'additionalProperties': {
                        return `${path}: unknown property "${e.params.additionalProperty}" is not allowed`;
                    }
                    case 'required': {
                        return `${path}: missing required property "${e.params.missingProperty}"`;
                    }
                    default:
                        return `${path}: ${e.message}`;
                }
            });

            // 3. Deduplicate and throw formatted error list
            const uniqueErrors = Array.from(new Set(formattedMessages));
            throw new Error(`\n- ${uniqueErrors.join('\n- ')}`);
        }
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
        parentCardinality?: '1' | 'N'
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
                            `Unknown orchestration strategy ${layoutSchema.orchestration_strategy}`,
                        )
                }
            } else if (cardinality === 'N') {
                if (layoutElementId !== 'root') {
                    throw new UISchemaError(
                        'Layouts for N cardinality are only allowed as root layouts.',
                    )
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
                            `Unknown orchestration strategy ${layoutSchema.orchestration_strategy}`,
                        )
                }
            } else {
                if (cardinality) {
                    throw new UISchemaError(
                        `Unknown cardinality ${cardinality as string} for layout ${layoutElementId}`,
                    )
                } else {
                    throw new UISchemaError(`no cardinality for layout ${layoutElementId}`)
                }
            }
        } else {
            throw new UISchemaError(`no orchestration strategy for layout ${layoutElementId}`)
        }
        if (newLayout) {
            this.layouts[layoutElementId] = newLayout
            return newLayout
        } else {
            throw new UISchemaError(`can't create layout ${layoutElementId}`)
        }
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
        dataContext: RenderContextDataContext
    ) {
        try {
            if (!this.uiElementFactory) {
                this.uiElementFactory = new UIConfigurableElementFactory()
                this.pluginManager?.fireSynchronously('registerUIElements', this.uiElementFactory)
            }
            const renderContext = new UIElementRenderContext(this, elementDefinition, dataContext, parentLayout)
            const uiElementClass = this.uiElementFactory.getUIElementClass(
                elementDefinition.element_type,
            )
            if ('binding' in renderContext.elementDefinition) {
                renderContext.elementDefinition.readonly =
                    renderContext.elementDefinition.readonly ||
                    parentLayout?.layoutDefinition?.readonly
            }
            return uiElementClass.render(renderContext, id)
        } catch (e) {
            console.error(`Exception in UIComponent.renderUIElement: ${e as string}`)
            return html` ${elementDefinition.element_type} "${id}": ${e} `
        }
    }

    public renderElement(
        id: string,
        elementDefinition: UISchemaUIElements,
        parentLayout: UILayout,
        dataContext: RenderContextDataContext
    ) {
        switch (elementDefinition.element_type) {
            case 'layout':
                return this.renderLayoutElement(id, elementDefinition, parentLayout, dataContext)
            default:
                return this.renderUIElement(id, elementDefinition, parentLayout, dataContext)
        }
    }

    public getPaddingStyle(padding?: string | number | UISchemaLayoutPadding) {
        let style = ''
        if (typeof padding === 'number') {
            style = `padding: ${padding}px`
        } else if (typeof padding === 'string') {
            style = `padding: ${padding}`
        } else if (padding) {
            style = `padding: ${(<UISchemaLayoutPadding>padding).top} ${(<UISchemaLayoutPadding>padding).right} ${(<UISchemaLayoutPadding>padding).bottom} ${(<UISchemaLayoutPadding>padding).left}`
        }
        return style
    }

    private onRerenderRequest = (event: Event) => {
        const uiRenderBoundary: UIRenderBoundary = event.currentTarget as UIRenderBoundary
        if (uiRenderBoundary && uiRenderBoundary.tagName === "UI-RENDER-BOUNDARY") {
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
        dataContext: RenderContextDataContext
    ): TemplateResult {
        let elementLayout
        try {
            elementLayout = this.getLayout(
                id,
                layoutDefinition,
                parentLayout.layoutDefinition.readonly,undefined,
                parentLayout.cardinality
            )

        } catch (e) {
            return html`cannot create layout ${id}: ${e}`
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
        const layoutRenderContext = new UILayoutRenderContext(this, layout.layoutDefinition,{recordIndex: -1}, undefined)
        return layout.renderLayout('root', layoutRenderContext, this.renderElement.bind(this))
    }

    protected renderBootSpinner() {
        return html`
            <div>...</div>`
    }

    protected render() {
        console.log("ui component rerender")
        // noinspection JSMismatchedCollectionQueryUpdate
        const itemTemplates: TemplateResult[] = []
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
                this._showError += `\nCannot initialize root Layout: ${(e as Error).message ?? String(e)}"`
            }
            if (!this._showError) {
                try {
                    if (this.uiSchema && rootLayout && this.dataProvider) {
                        itemTemplates.push(this.renderRootLayout(rootLayout))
                    } else {
                        itemTemplates.push(this.renderBootSpinner())
                    }
                } catch (e) {
                    this._showError += `\nAn error occurred when rendering this component:"${e as string}"`
                }
            }
        }

        if (this._showError) {
            console.log(this._showError)
            itemTemplates.push(html`
                <div
                        style="background-color: var(--col-bg-alert); color: var(--col-primary-bg-alert); padding: .5em; font-family: monospace;white-space: pre-line;"
                >
                    ${this._showError}
                </div>`)
        }

        return html`${itemTemplates}`
    }
}
