import {UIElement} from "./uielement";
import {UIElementRenderContext} from "../uielementrendercontext"

import {nothing, html} from "lit";
import { DateTime } from "luxon"
import {ApiTimeZoneInfo, UISchemaDateTimeField} from "../uischema";
import {getLatinDate} from "../tools";
// import {computePosition} from "@floating-ui/dom";

export class UIElementDateTimeField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels) ? html`
            <label for="${id}">${text} 
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)
    }

    static openDateTimePopover(e: MouseEvent) {
        if (e.target) {
            e.stopPropagation()
            const target = <HTMLElement>e.target
            let icon: HTMLElement
            let popover: HTMLElement
            if (target.tagName === "I") {
                icon = <HTMLDivElement>e.target
                popover = <HTMLElement>icon.firstElementChild
            } else {
                popover = target
                icon = <HTMLElement>target.parentElement
            }
            if (popover.checkVisibility()) {
                icon.style.backgroundColor = "unset"
                popover.style.display = "none"
            } else {
                icon.style.backgroundColor = "var(--col-bg-ack)"
                popover.style.display = "block"
            }
        }

    }
    static render(context: UIElementRenderContext, id: string) {
        try {
            const ts_value = this.haulData(context, context.entry.element_type.value, id)?.split("@")
            let value = ts_value?ts_value[0]:""
            let timeZoneInfo: ApiTimeZoneInfo | undefined = undefined

            if (ts_value && ts_value[1] && ts_value[1] !=="-" ) {
                timeZoneInfo = this.getTimeZoneInfo(context, parseInt(ts_value[1]))
            }

            if (!this.isVisible(context, value)) {
                return html`${nothing}`
            }
            const text = this.haulData(context, context.entry.element_type.text)
            const htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
            const cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))

            let ts = DateTime.fromISO(value, {zone: "utc",setZone: true})

            let includeTime = (context.entry.element_type as UISchemaDateTimeField).include_time
            if (includeTime === undefined) includeTime = true
            let tsValue: string | undefined = undefined
            if (ts.isValid) {
                // console.log(`${id} ts is valid and is: ${value}`)
                if (timeZoneInfo) ts = ts.setZone(timeZoneInfo.tz_IANA)
                if (((context.entry.element_type as UISchemaDateTimeField).date_format || "latin") === "latin") {
                    tsValue = getLatinDate(ts, includeTime)
                } else {
                    tsValue = (includeTime ? ts.toLocaleString(DateTime.DATETIME_SHORT) : ts.toLocaleString(DateTime.DATE_SHORT))
                }
            } else {
                console.log(`${id} ts is NOT valid and is: ${value}`)
            }

            return context.layouter.renderElement(context.entry.layout, html`
                ${this.renderLabel(context, id, text)}
                ${context.entry.element_type.readonly ?
                        html`<div class="date-time-frame">
                            ${timeZoneInfo?html`<i class="time-zone-marker" @click="${this.openDateTimePopover}">
                                <div class="date-time-popover" @click="${this.openDateTimePopover}">${timeZoneInfo?timeZoneInfo.tz_long:"unspecified time zone"}</div></i>
                            `:nothing}
                            <input id=${id} name=${id} class="input-right-align ${htmlClass}"
                                    style="${cssStyle}"
                                    value="${tsValue||nothing}"
                                    @change="${context.uicomponent.fieldChanged}"
                                    ?disabled=${(context.entry.element_type.readonly)}>
                        </div>` :
                        html`${timeZoneInfo?html`<div class="date-time-frame"><i class="time-zone-marker"></i>`:nothing}
                            <vaadin-date-time-picker
                                    id=${id} name=${id} class="${htmlClass}"
                                    style="${cssStyle}"
                                    value="${tsValue||nothing}"
                                    @change="${context.uicomponent.fieldChanged}"
                                    ?disabled=${(!context.entry.element_type.enabled)}>
                            </vaadin-date-time-picker></div`}
            `)
        } catch (e) {
            console.error(`datetimefield.render: ${e} with context`, context)
            throw e
        }
    }
}