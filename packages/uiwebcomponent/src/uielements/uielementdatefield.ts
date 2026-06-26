import {UIElement} from "./uielement";
import {UIElementRenderContext} from "../uielementrendercontext"
// import {html} from "lit/static-html.js";
import {nothing, html} from "lit";
import { DateTime } from "luxon";
import {UISchemaDateTimeField} from "../uischema";
import {getLatinDate} from "../tools";

export class UIElementDateField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels) ? html`
            <label for="${id}">${text} 
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)
    }

    static render(context: UIElementRenderContext, id: string) {
        try {
            const value = this.haulData(context, context.entry.element_type.value)
            if (!this.isVisible(context, value)) {
                return html`${nothing}`
            }
            let text = this.haulData(context, context.entry.element_type.text)
            const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
            const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))
            const ts = DateTime.fromISO(value)
            let tsValue: string | undefined = undefined
            if (ts.isValid) {
                if (((context.entry.element_type as UISchemaDateTimeField).date_format || "latin") === "latin") {
                    tsValue = getLatinDate(ts, false)
                } else {
                    tsValue = ts.toLocaleString(DateTime.DATE_SHORT)
                }
            }

            return context.layouter.renderElement(context.entry.layout, html`
                ${this.renderLabel(context, id, text)}
                ${context.entry.element_type.readonly ?
                        html`<input id=${id} name=${id}
                                    class="input-right-align ${htmlClass}"
                                    style="${cssStyle}"
                                    value="${tsValue || nothing}"
                                    @change="${context.uicomponent.fieldChanged}"
                                    ?disabled=${(context.entry.element_type.readonly)}>
                        </input>` :
                        html`
                            <vaadin-date-picker id=${id} name=${id}
                                                class="${htmlClass || nothing}"
                                                style="${cssStyle || nothing}"
                                                value="${tsValue || nothing}"
                                                @change="${context.uicomponent.fieldChanged}"
                                                ?disabled=${(!context.entry.element_type.enabled)}>
                            </vaadin-date-picker>`}
            `)
        } catch(e) {
            console.error(`datefield.render: ${e} with context`, context)
            throw e
        }
    }
}