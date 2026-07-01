import {UIElement} from "./uielement";
import {nothing, html} from "lit";
import {UIElementRenderContext} from "../uielementrendercontext";

export class UIElementBoolField extends UIElement {
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
            if (context.entry.layout?.max_height) {
                cssStyle = this.addStyle(cssStyle, `max-height: ${context.entry.layout.max_height === "max"? "none" : context.entry.layout.max_height + "em"}`)
            }

            if (context.entry.element_type.readonly) {
                return context.layouter.renderElement(context.entry.layout, html`
                    ${this.renderLabel(context, id, text)}
                    <div style="${cssStyle ? cssStyle : nothing}" id=${id} 
                         class="read-only-textarea ${htmlClass}"><span><span>${value?"YES":"NO"}</span></span></div>
                `)
            } else {
                htmlClass = (htmlClass?htmlClass + " input-checkbox":"input-checkbox")
                return context.layouter.renderElement(context.entry.layout, html`
                    ${this.renderLabel(context, id, text)}
                    <input id=${id} name=${id} type="checkbox" class="${htmlClass}"
                           style="${cssStyle ? cssStyle : nothing}"
                           ?checked="${(!!value)}"
                           @change="${context.uicomponent.fieldChanged}"
                           ?disabled=${!(context.entry.element_type.enabled)}/>
                `)
            }
        } catch (e) {
            console.error(`textfield.render: ${e} with context`, context)
            throw e
        }
    }
}