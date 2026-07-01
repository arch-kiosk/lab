import {UIElement} from "./uielement";
import {UIElementRenderContext} from "../uielementrendercontext"

// import {html} from "lit/static-html.js";
import {nothing, html} from "lit";

export class UIElementTemplateLabel extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels && context.entry.element_type.text) ? html`
            <label for="${id}">${text}
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : nothing
    }

    static render(context: UIElementRenderContext, id: string) {
        const value = this.haulData(context, context.entry.element_type.value)
        if (!this.isVisible(context, value)) {
            return html`${nothing}`
        }
        const text = this.haulData(context, context.entry.element_type.text)
        const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))
        this.addStyle(cssStyle, context.uicomponent.getPaddingStyle(context.entry.layout?.padding).replace("padding", "margin"))
        return context.layouter.renderElement(context.entry.layout, html`
            ${this.renderLabel(context, id, text)}
            <div class="templateLabel ${htmlClass}" id=${id} 
                 style="${cssStyle?cssStyle:nothing}">
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}${value || nothing}
            </div>
        `)
    }
}