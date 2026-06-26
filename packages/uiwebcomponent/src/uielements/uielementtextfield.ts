import {UIElement} from "./uielement";
import {nothing, html} from "lit";
import {UISchemaTexTField} from "../uischema";
import {UIElementRenderContext} from "../uielementrendercontext";

export class UIElementTextField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels) ? html`
            <label for="${id}">${text?text:nothing}
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)
    }

    static render(context: UIElementRenderContext, id: string) {
        try {
            let value = this.haulData(context, context.entry.element_type.value, id)

            if (!this.isVisible(context, value)) {
                return html`${nothing}`
            }
            let text = this.haulData(context, context.entry.element_type.text)
            let htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
            let cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))
            let isIdentifier = this.isIdentifier(context)
            if (context.entry.layout?.max_height) {
                cssStyle = this.addStyle(cssStyle, `max-height: ${context.entry.layout.max_height === "max"? "none" : context.entry.layout.max_height + "em"}`)
            }
            if (this.isIdentifier(context)) {
                htmlClass = (htmlClass?" ":"") + "identifier-link"
            }

            if ((context.entry.element_type as UISchemaTexTField).multiline) {
                if (typeof value === "string") {
                    value = value.replaceAll("\r\n", "\n")
                    value = value.replaceAll("\r", "\n")
                }
                if ((!context.entry.element_type.enabled) || context.entry.element_type.readonly) {
                    return context.layouter.renderElement(context.entry.layout, html`
                        ${this.renderLabel(context, id, text)}
                        <div style="${cssStyle ? cssStyle : nothing}" id=${id} class="multiline-textarea read-only-textarea ${htmlClass}">${value || nothing}</div>
                    `)
                } else {
                    return context.layouter.renderElement(context.entry.layout, html`
                        ${this.renderLabel(context, id, text)}
                        <textarea id=${id} class="${htmlClass}" style="${cssStyle ? cssStyle : nothing}" name=${id}
                                  @change="${context.uicomponent.fieldChanged}">${value || nothing}</textarea>
                    `)
                }
            } else {
                if ((!context.entry.element_type.enabled) || context.entry.element_type.readonly) {
                    return context.layouter.renderElement(context.entry.layout, html`
                        ${this.renderLabel(context, id, text)}
                        <div style="${cssStyle ? cssStyle : nothing}" id=${id} 
                             class="read-only-textarea ${htmlClass}"
                             data-identifier="${isIdentifier?value:nothing}"
                             @click="${isIdentifier?context.uicomponent.gotoIdentifier:nothing}"><span>${isIdentifier?html`<i class="footsteps"></i>`:nothing}<span>${value || nothing}</span></span></div>
                    `)
                } else {
                    return context.layouter.renderElement(context.entry.layout, html`
                        ${this.renderLabel(context, id, text)}
                        <input id=${id} name=${id} type="text" class="${htmlClass}"
                               style="${cssStyle ? cssStyle : nothing}"
                               value="${value || nothing}"
                               @change="${context.uicomponent.fieldChanged}"
                               ?disabled=${(!context.entry.element_type.enabled) || context.entry.element_type.readonly}/>
                    `)
                }
            }
        } catch (e) {
            console.error(`textfield.render: ${e} with context`, context)
            throw e
        }
    }
}