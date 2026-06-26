import {UIElement} from "./uielement";
import {nothing, html} from "lit";
import {UISchemaButton, UISchemaUIElementType} from "../uischema";
import {UIElementRenderContext} from "../uielementrendercontext";

export class UIElementButton extends UIElement {
    static defaultAction(element: UISchemaUIElementType): string|undefined {
        return element?.default
    }

    static render(context: UIElementRenderContext, id: string) {
        const button = <UISchemaButton>context.entry.element_type
        let buttonText = ""
        let buttonClass = "modal-button"
        let extraStyle = button.extra_style ? button.extra_style : nothing
        if (!this.isVisible(context, "")) {
            return html`${nothing}`
        }

        switch (button.type) {
            case "cancelButton":
                buttonClass = "modal-cancel"
                break
            case "okButton":
                buttonClass = "modal-ok"
                break
            case "iconButton":
                buttonClass = "modal-round-button"
                buttonText = button.icon!
                break
            default:
                break
        }
        const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
        buttonClass = htmlClass ? buttonClass + " " + htmlClass : buttonClass
        return context.layouter.renderElement(context.entry.layout, html`
            <button class="${buttonClass}" style="${extraStyle}" id=${id} name=${id}
                    @click="${context.uicomponent.fieldChanged}"">
            ${buttonText}
            </button>
        `)
    }
}