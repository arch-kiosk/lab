"use strict";
import {unsafeCSS, LitElement, TemplateResult, PropertyValues} from "lit";
import {html} from 'lit/static-html.js'
import {customElement, property, state} from "lit/decorators.js";
import '@vaadin/date-picker'
import '@vaadin/date-time-picker'
import '@vaadin/combo-box'
import './fileview'

// import local_css from "/src/static/logviewerapp.sass?inline";
// @ts-ignore
import local_css from "./styles/ui-component.sass?inline";
import {UIElementFactory} from "./uielementfactory";

import {
    UISchema,
    UIInputData,
    UISchemaUIElement,
    UISchemaLayoutElement,
    UISchemaLayoutSettings,
    UISchemaLayoutPadding,
    UISchemaComboBox,
    UISchemaLookupProvider,
    Dictionary,
    UISchemaUIElementWithId,
    UISchemaLookupSettings,
    UIComponentDataProvider,
    UIComponentMoveToNextRowProvider,
    UIComponentSetSortOrderProvider,
    UIComponentFetchFileProvider, UIComponentFileFetchParams, UIComponentTimeZoneInfoProvider

} from "./uischema";

export type * from "./uischema"
export type {ApiTimeZoneInfo} from "./uischema";

import {
    UIStackLayoutClass,
    UIColumnLayoutClass,
    UILayoutClass,
    UIRightAlignLayoutClass,
    UITableLayoutClass, UIGalleryLayoutClass
} from "./layoutclasses"
import {UIElementRenderContext, UILayoutRenderContext} from "./uielementrendercontext";
import {UIDefaultElementFactory} from "./uidefaultelementfactory";
import {ComboBox, ComboBoxFilterChangedEvent} from "@vaadin/combo-box";

@customElement("ui-component")
export class UIComponent extends LitElement {
    static styles = unsafeCSS(local_css);
    _messages: { [key: string]: object } = {};
    _dsd_to_element_list: { [key: string]: UISchemaUIElementWithId } = {}
    _element_list: { [key: string]: UISchemaUIElement } = {}
    _selection_data: { [key: string]: { [key: string]: string } } = {}

    @property()
    uiElementFactory: UIElementFactory | null = new UIDefaultElementFactory()

    @property()
    uiSchema: UISchema | null = null

    @property()
    linkIdentifiers: boolean = true

    @property()
    showDevelopmentInfo: boolean = false

    @property()
    data: UIInputData = {}

    @property()
    lookupProvider: UISchemaLookupProvider | null = null

    @property()
    dataProvider: UIComponentDataProvider | null = null

    @property()
    timeZoneInfoProvider: UIComponentTimeZoneInfoProvider | null = null

    @property()
    moveToNextRow: UIComponentMoveToNextRowProvider | null = null

    @property()
    setSortOrder: UIComponentSetSortOrderProvider | null = null

    @property()
    fetchFileProvider: UIComponentFetchFileProvider | null = null

    @state()
    _showError: string | null = null

    private _default: { [key: string]: string } = {};

    constructor() {
        super();
        this._messages = {}
        // this.addEventListener('click', (e) => console.log(e), {capture: true});
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        // super.willUpdate(_changedProperties);
        if (_changedProperties.has("uiSchema")) {
            this.processSchemaDefinition()
        }
    }

    public keyupOnElement(e: KeyboardEvent) {
        if (e.key === "Enter" && this._default?.["ENTER"]) {
            this.fieldChangedById(this._default?.["ENTER"])
        } else {
            if (e.key === "Escape" && this._default?.["CANCEL"]) {
                this.fieldChangedById(this._default?.["CANCEL"])
            }
        }
    }

    firstUpdated(_changedProperties: any) {
        super.firstUpdated(_changedProperties);

        for (const comboBox of this.renderRoot.querySelectorAll('vaadin-combo-box')) {
            if (comboBox && !comboBox.items && this.lookupProvider) {
                let lookupProvider = this.lookupProvider
                let element = this.getSchemaElement(comboBox.id)
                if (element.element_type.name.toLowerCase() !== "selection")
                    continue
                const selectionElement = (<UISchemaComboBox>element.element_type)

                // if this is a selection with a static list, no dataProvider is necessary
                if (Array.isArray(selectionElement.items))
                    continue

                //Todo: This should be in the uielementcombobox.ts
                comboBox.dataProvider = async (params, callback) => {
                    if (!(comboBox.id in this._selection_data)) {
                        console.log("looking up", params)
                        lookupProvider(comboBox.id,
                            <UISchemaLookupSettings>selectionElement.items,
                            params,
                            (items, size?: number) => {
                                //this is a finite list: The callback gets all items at once.
                                //item[1] is the display value, item[0] is the data value of the selection
                                const valuesOnly = []
                                this._selection_data[comboBox.id] = {}

                                for (const item of items) {

                                    this._selection_data[comboBox.id][item[1]] = item[0]
                                    valuesOnly.push(item[1])
                                }
                                callback(valuesOnly, size)
                            })
                    } else {
                        const values = Object.entries(this._selection_data[comboBox.id]).map(x => x[0]).filter(v => v.startsWith(params.filter))
                        callback(values, values.length)
                    }
                }
            }
        }
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
    }

    getSchemaElement(id: string) {
        return this._element_list[id]
    }

    // private _isScrollable (node: Element) {
    //     if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    //         return false
    //     }
    //     const style = getComputedStyle(node)
    //     return ['overflow', 'overflow-x', 'overflow-y'].some((propertyName) => {
    //         const value = style.getPropertyValue(propertyName)
    //         return value === 'auto' || value === 'scroll'
    //     })
    // }
    //
    // public getScrollParent (node: Element): HTMLElement {
    //     let currentParent = node.parentElement
    //     while (currentParent) {
    //         if (this._isScrollable(currentParent)) {
    //             return currentParent
    //         }
    //         currentParent = currentParent.parentElement
    //     }
    //     return <HTMLElement> (document.scrollingElement || document.documentElement)
    // }

    public gotoRecord(uid: string) {
        try {
            let el = this.shadowRoot?.querySelector(`#R${uid}`)
            if (el) {
                // (<HTMLElement>el).style.border = "1px solid red"
                console.log(`gotoRecord found`, el)
                el.scrollIntoView()
                // if (scrollBy != 0) {
                //     if (typeof scrollParent === "undefined") {
                //         scrollParent = this.getScrollParent(el)
                //     }
                //     if (scrollParent) {
                //         console.log("scrollParent", scrollParent)
                //         scrollParent.scrollBy(0, scrollBy)
                //     } else {
                //         console.log("NO scrollParent at all found.")
                //     }
                // }
                this.dispatchEvent(new CustomEvent("scrolled-into-view", {
                    detail: {
                        "element": el,
                    },
                    composed: true,
                    bubbles: true
                }))
                console.log("scrolled-into-view triggered for ", el)
                return true
            } else {
                console.error(`uicomponent.gotoRecord: #R${uid} not found.`)
            }
        } catch (e) {
            console.error(`uicomponent.gotoRecord: #R${uid} error`, e)
        }
        return false
    }

    processSchemaDefinition() {
        const _add_elements = (ui_elements?: Dictionary<UISchemaUIElement>) => {
            if (ui_elements) {
                Object.entries(ui_elements).map(([id, entry]) => {
                    const regex = new RegExp('^[a-z][a-z0-9\\-_]*$', "gmi")
                    if (!id.match(regex)) {
                        console.log(`element id ${id} is illegal`)
                        showError = `There is an error in the schema definition: the element id "${id}" is illegal. It must start with a letter followed by only letters and numbers`
                        return
                    }
                    if (id_list.find(x => x === id)) {
                        console.log(`element id ${id} used more than once in UI schema`)
                        showError = `There is an error in the schema definition: the element id "${id}" is used more than once in the UI schema`
                        return
                    }
                    if (Object.keys(entry).length == 0 || !Object.hasOwn(entry,"element_type")) {
                        console.error(`ui-component: Element id ${id} has insufficient data: skipped.`, entry)
                        id_skipped.push(id)
                    } else {
                        id_list.push(id)
                        const dsd_field = entry.binding?.field_name?.toLowerCase()
                        if (dsd_field) {
                            if (dsd_field in dsd_to_element_list) {
                                console.log(`dsd field ${dsd_field} bound again in element ${id} in UI schema`)
                                showError = `There is an error in the schema definition: dsd field "${dsd_field}" bound again in element "${id}" in UI schema`
                                entry.element_type.enabled = false
                            } else {
                                dsd_to_element_list[dsd_field] = {"id": id, "element": entry}
                            }
                        }
                        if (entry.element_type.enabled === undefined)
                            entry.element_type.enabled = true
                        if (entry.element_type.default) {
                            this.registerDefault(id, entry)
                        }
                        element_list[id] = entry
                        if (entry.element_type.name === "layout") {
                            _add_elements((<UISchemaLayoutElement>entry.element_type).ui_elements)
                        }
                    }

                })
            }
        }

        this._dsd_to_element_list = {}
        const id_list: Array<string> = []
        const id_skipped: Array<string> = []
        let showError = ""
        const dsd_to_element_list = this._dsd_to_element_list
        const element_list = this._element_list
        if (this.uiSchema) {
            _add_elements(this.uiSchema.ui_elements)
        }
        id_skipped.forEach(id => delete(this.uiSchema?.ui_elements[id]))
        console.log("element_list", element_list, this.uiSchema)
        this._showError = showError
        // console.log(this._dsd_to_element_list)
    }

    private registerDefault(id: string, entry: UISchemaUIElement) {
        console.log(`default for ${entry.element_type.name} ${id} is ${entry.element_type.default}`)
        if (entry.element_type?.default) {
            this._default[entry.element_type.default] = id
        }
    }


    gatherData() {
        const result: { [key: string]: any } = {}
        if (!this._dsd_to_element_list || Object.keys(this._dsd_to_element_list).length === 0) return {}
        Object.entries(this._dsd_to_element_list).map(([dsd_field, element_entry]) => {
            result[dsd_field] = this.get_field_value(element_entry.id, element_entry.element)
        })
        return result
    }

    public fetchFile(event: CustomEvent) {
        const params = event.detail as UIComponentFileFetchParams
        if (this.fetchFileProvider) {
            this.fetchFileProvider(params)
        }
    }


    get_field_value(id: string, element: UISchemaUIElement) {
        const domElement: HTMLFormElement | null = this.renderRoot.querySelector(`#${id}`)
        switch (element.element_type.name.toLowerCase()) {
            case "selection":
                return this.getSelectionValue(id, domElement, element.element_type as UISchemaComboBox)
            case "bool":
                return !!domElement?.checked
            default:
                return domElement?.value ? domElement?.value : ""

        }
    }

    //Todo: This should be in the uielementcombobox.ts
    getSelectionValue(id: string, domElement: HTMLFormElement | null, comboBox: UISchemaComboBox) {
        let displayValue = domElement?.value ? domElement?.value : ""
        let dataValue: any
        this._element_list[id].element_type
        if (Array.isArray(comboBox.items) && comboBox.items.length > 0) {
            if (Array.isArray(comboBox.items[0])) {
                for (const item of comboBox.items) {
                    if (item[1] === displayValue) {
                        dataValue = item[0]
                        break;
                    }
                }
            } else {
                dataValue = displayValue
            }
        } else {
            dataValue = domElement?.getAttribute("data-value")
            if (displayValue) {
                if (id in this._selection_data) {
                    try {
                        dataValue = this._selection_data[id][displayValue]
                    } catch {
                    }
                }
            }
        }
        return dataValue ? dataValue : ""
    }

    fieldChangedById(id: string) {
        const options = {
            detail: {
                "srcElement": id,
                "newData": this.gatherData()
            },
            bubbles: true
        }
        this.dispatchEvent(new CustomEvent('dataChanged', options))
    }

    fieldChanged(e: Event) {
        if ("currentTarget" in e) {
            const id = (<HTMLElement>e.currentTarget).id
            // const element = this.getSchemaElement(id)
            // if (element.element_type.name.toLowerCase() == "selection") {
            //     this.selectionChanged(<HTMLInputElement>e.currentTarget)
            // }
            this.fieldChangedById(id)
        }
    }

    comboBoxFilterChanged(e: ComboBoxFilterChangedEvent) {
        const filter = e.detail.value.toLowerCase();
        const comboBox = (e.currentTarget as ComboBox)
        if (comboBox) {
            if (filter === "") {
                comboBox.filteredItems = undefined
            }
            let filteredItems = this._selection_data[comboBox.id]
            if (filteredItems) {
                let filteredItemsList = Object.keys(filteredItems).filter(v => v.toLowerCase().startsWith(filter))
                comboBox.filteredItems = filteredItemsList
            }
        }
    }


    getLayoutClass(layoutElementId: string, layoutSettings?: UISchemaLayoutSettings, inheritReadOnly = false): UILayoutClass {
        const layoutType = layoutSettings?.type || "sheet"
        if (inheritReadOnly)
            if (layoutSettings && inheritReadOnly)
                layoutSettings.readonly = inheritReadOnly
        if (layoutSettings?.orchestration_strategy) {
            if (layoutType === "sheet") {
                switch (layoutSettings?.orchestration_strategy.toLowerCase()) {
                    case "columns":
                        return new UIColumnLayoutClass(layoutElementId, layoutSettings)
                    case "rightalign":
                        return new UIRightAlignLayoutClass(layoutElementId, layoutSettings)
                    case "stack":
                        return new UIStackLayoutClass(layoutElementId, layoutSettings)
                    default:
                        throw `Unknown orchestration strategy ${layoutSettings.orchestration_strategy}`
                }
            } else if (layoutType === "list") {
                switch (layoutSettings?.orchestration_strategy.toLowerCase()) {
                    case "columns":
                        return new UIColumnLayoutClass(layoutElementId, layoutSettings)
                    case "table":
                        return new UITableLayoutClass(layoutElementId, layoutSettings)
                    case "gallery":
                        return new UIGalleryLayoutClass(layoutElementId, layoutSettings)
                    default:
                        throw `Unknown orchestration strategy ${layoutSettings.orchestration_strategy}`
                }
            } else {
                throw `Unknown layout type ${layoutType}`
            }
        } else
            return new UIColumnLayoutClass(layoutElementId, layoutSettings)
    }

    /**
     *
     * @param id the id here is the id of the element in the element tree of the ui definition! It is not a unique id within the html document.
     * @param entry
     * @param layouter
     */
    renderUIElement(id: string, entry: UISchemaUIElement, layouter: UILayoutClass) {
        try {
            if (!this.uiElementFactory) {
                throw `UIComponent.renderUIElement: no elementFactory to instantiate ${entry.element_type.name}`
            }

            const renderContext = new UIElementRenderContext(this, entry, layouter, this.data)
            const uiElementClass = this.uiElementFactory.getUIElementClass(entry.element_type.name)
            renderContext.entry.element_type.readonly = renderContext.entry.element_type.readonly || layouter?.layoutSettings?.readonly
            return uiElementClass.render(renderContext, id)
        } catch (e) {
            console.error(`Exception in UIComponent.renderUIElement: ${e}`)
            return html`
                ${entry.element_type.name} "${id}": ${e}
            `
        }
    }

    renderElement(id: string, entry: UISchemaUIElement, layouter: UILayoutClass) {
        switch (entry.element_type.name.toLowerCase()) {
            case "layout":
                return this.renderLayoutElement(id, <UISchemaLayoutElement>entry.element_type, layouter)
            default:
                return this.renderUIElement(id, entry, layouter)
        }
    }

    getPaddingStyle(padding?: string | number | UISchemaLayoutPadding) {
        let style = ""
        if (typeof padding === "number") {
            style = `padding: ${padding}px`
        } else if (typeof padding === "string") {
            style = `padding: ${padding}`
        } else if (padding) {
            style = `padding: ${(<UISchemaLayoutPadding>padding).top} ${(<UISchemaLayoutPadding>padding).right} ${(<UISchemaLayoutPadding>padding).bottom} ${(<UISchemaLayoutPadding>padding).left}`
        }
        return style
    }

    private onRequestUpdate() {
        console.log("requesting update")
        this.requestUpdate()
    }

    renderLayoutElement(id: string, entry: UISchemaLayoutElement, layouter: UILayoutClass): TemplateResult {

        let elementLayouter
        try {
            elementLayouter = this.getLayoutClass(id, entry.layout_settings, layouter.layoutSettings?.readonly)
            elementLayouter.onRequestUpdate = this.onRequestUpdate
        } catch (e) {
            return html`cannot create layout ${id}: ${e}`
        }

        // const layoutType: string = entry.layout_settings?.type || "sheet"
        let style = layouter.renderLayoutStyles(entry.layout)
        style += style ? ";" : "" + this.getPaddingStyle(entry.layout?.padding)

        const layoutRenderContext = new UILayoutRenderContext(this, entry, elementLayouter, this.data)
        return elementLayouter.renderLayout(layoutRenderContext, elementLayouter, style, this.renderElement.bind(this))
    }

    hideDevelopmentInfo() {
        this.renderRoot.querySelectorAll(".developer-info").forEach(e => (e as HTMLElement).style.display = "none")
    }

    gotoIdentifier(event: PointerEvent) {
        const detail = {
            identifier: (event.currentTarget as HTMLElement).dataset.identifier,
            fieldId: (event.currentTarget as HTMLElement).id
        }
        const gotoEvent = new CustomEvent('goto-identifier',
            {detail, bubbles: false, composed: true, cancelable: false});
        this.dispatchEvent(gotoEvent);
    }


    render() {
        const itemTemplates: TemplateResult[] = []
        let layoutClass
        if (this.showDevelopmentInfo)
            itemTemplates.push(html`
                <div class="uicomponent-version" @click="${this.hideDevelopmentInfo}">
                    ${html`${(import.meta as any).env.PACKAGE_VERSION}`}
                </div>`)
        try {
            layoutClass = this.getLayoutClass("root", this.uiSchema?.layout_settings)
            layoutClass.onRequestUpdate = this.onRequestUpdate.bind(this)

        } catch (e) {
            this._showError = `The schema definition is calling an unknown Orchestration Strategy "${this.uiSchema?.layout_settings?.orchestration_strategy}"`
        }
        if (!this._showError) {
            try {
                if (this.uiSchema && layoutClass) {
                    const layoutRenderContext = new UILayoutRenderContext(this, this.uiSchema, layoutClass, this.data)
                    itemTemplates.push(layoutClass.renderLayout(layoutRenderContext, layoutClass, "", this.renderElement.bind(this)))
                }
            } catch (e) {
                this._showError = `An error occurred when rendering this component:\n"${e}"`
            }
        }
        if (this._showError) {
            console.log(this._showError)
            itemTemplates.push(html`
                <div style="background-color: var(--col-bg-alert); color: var(--col-primary-bg-alert); padding: .5em; font-family: monospace">
                    ${this._showError}
                </div>`)
        }

        return html`${itemTemplates}`
    }
}
