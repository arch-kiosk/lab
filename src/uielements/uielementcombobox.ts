import {UIElement} from "./uielement";
import {replaceData} from "../tools";
// import {html} from "lit/static-html.js";
import {nothing, html} from "lit";
import {Dictionary, UISchemaComboBox} from "../uischema";
import {UIElementRenderContext} from "../uielementrendercontext";

export class UIElementComboBox extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels) ? html`
            <label for="${id}">${text}
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)
    }

    static renderReadOnly(context: UIElementRenderContext, id: string, text: string) {
        let value = this.haulData(context, context.entry.element_type.value, id)
        if (!this.isVisible(context, value)) {
            return html`${nothing}`
        }
        const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))

        return context.layouter.renderElement(context.entry.layout,
            html`
                ${this.renderLabel(context, id, text)}
                <input id=${id} name=${id} type="text"
                       class="${htmlClass}"
                       style="${cssStyle}"
                       value="${value || nothing}"
                       disabled/>
            `)
    }

    static renderWithStaticSelection(context: UIElementRenderContext, id: string, text: string) {
        const comboBoxItems = []
        let value = ""
        const element = context.entry.element_type as UISchemaComboBox

        if (Array.isArray(element.items)) {  //used only as a typescript type guard here
            for (const item of element.items) {
                const itemText = Array.isArray(item) ? (item.length > 1 ? item[1] : item[0]) : item
                const itemValue = Array.isArray(item) ? item[0] : item
                comboBoxItems.push(itemText)
                if (context.data[id] === itemValue) {
                    const data: Dictionary<string> = {}
                    data[id] = itemText
                    value = replaceData(context.entry.element_type.value, data)
                }
            }
        }

        // does not seem to make much sense for a selection
        // if (!this.isVisible(context, value)) {
        //     return html`${nothing}`
        // }
        const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))

        return context.layouter.renderElement(context.entry.layout, html`
                    ${this.renderLabel(context, id, text)}
                    <vaadin-combo-box id="${id}" name="${id}" .items="${comboBoxItems}"
                                      .selectedItem="${value || nothing}"
                                      class="${htmlClass}"
                                      style="${cssStyle}"
                                      @change="${context.uicomponent.fieldChanged}"
                                      @keyup="${context.uicomponent.keyupOnElement}">
                                      ?disabled=${(!context.entry.element_type.enabled)}
                    </vaadin-combo-box>
                `)
    }

    static renderWithDynamicSelection(context: UIElementRenderContext, id: string, text: string) {
        // if the combobox is dynamic the value in the data MUST be a tuple with
        // [display-value,value]
        let displayValue = ""
        let value = ""
        const elementData = id in context.data ? context.data[id] : ""
        if (Array.isArray(elementData) && elementData.length == 2) {
            displayValue = elementData[0]
            value = elementData[1]
        }

        // does not seem to make much sense for a selection
        // if (!this.isVisible(context, value)) {
        //     return html`${nothing}`
        // }

        const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))

        return context.layouter.renderElement(context.entry.layout, html`
                ${this.renderLabel(context, id, text)}
                <vaadin-combo-box id="${id}" name="${id}"
                                  .selectedItem="${displayValue || nothing}"
                                  class="${htmlClass}"
                                  style="${cssStyle}"
                                  value="${displayValue || nothing}"
                                  data-value="${value}"
                                  @change="${context.uicomponent.fieldChanged}"
                                  @keyup="${context.uicomponent.keyupOnElement}"
                                  @filter-changed="${context.uicomponent.comboBoxFilterChanged}"
                                  ?disabled=${(!context.entry.element_type.enabled)}>
                </vaadin-combo-box>
            `)
    }

    static render(context: UIElementRenderContext, id: string) {
        try {
            const element = <UISchemaComboBox>context.entry.element_type
            let text = this.haulData(context, context.entry.element_type.text)
            if (context.entry.element_type.readonly) {
                return this.renderReadOnly(context, id, text)
            }

            if (Array.isArray(element.items)) {
                return this.renderWithStaticSelection(context, id, text)
            } else {
                if (element.items && 'topic' in element.items) {
                    return this.renderWithDynamicSelection(context, id, text)
                } else {
                    return html`
                        <div class="combobox-div" style="${context.layouter.renderLayoutStyles(context.entry.layout)}">
                            <label for="${id}">${text!}${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}</label>
                            <div>selection field ${id} is missing a list.</div>
                        </div>`
                }
            }
        } catch (e) {
            console.error(`combobox.render: ${e} with context`, context)
            throw e
        }
    }
}