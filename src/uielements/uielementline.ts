import {UIElement} from "./uielement";
import {UIElementRenderContext} from "../uielementrendercontext"

// import {html} from "lit/static-html.js";
import {html, nothing} from "lit";
import {UISchemaLine} from "../uischema";

export class UIElementLine extends UIElement {

    // line needs a different way of dealing with the defaultElementVisibility
    // @ts-ignore
    static isVisible(context: UIElementRenderContext, value: any) {
        let visible = <any> context.entry.element_type.visible
        if (visible === undefined) visible = context.layouter.defaultElementVisibility
        if (visible === "false" || visible == false) return false
        if (visible === "true" || visible == true) return true
        if (visible === ".") {
            // lines don't have a value, so they are always visible on "."
            return true
        }
        return Boolean(this.haulData(context, visible))
    }

    static render(context: UIElementRenderContext, id: string) {
        if (!this.isVisible(context, "")) {
            return html`${nothing}`
        }

        let cssClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        cssClass = (cssClass?cssClass + " ":"") + (((context.entry.element_type as UISchemaLine).transparent)?"ui-line-transparent":"")

        let style = context.uicomponent.getPaddingStyle(
            context.entry.element_type.padding).replace("padding", "margin")

        const cssStyle = this.addStyle(style, context.layouter.renderLayoutStyles(context.entry.layout))

        return context.layouter.renderElement(context.entry.layout, html`
            <div class="ui-line ${cssClass}" id="${id}" style="${cssStyle}">
            </div>
        `)
    }
}