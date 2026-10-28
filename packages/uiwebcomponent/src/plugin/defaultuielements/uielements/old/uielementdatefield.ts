import { UIElement } from '#src/uielement'
import { UIElementRenderContext } from '#src/uielementrendercontext'
// import {html} from "lit/static-html.js";
import { nothing, html } from 'lit'
import { DateTime } from 'luxon'
import { UISchemaDateTimeField } from '#src/uischema'
import { getLatinDate } from '#src/tools'

export class UIElementDateField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return context.parentLayout.renderElementLabels
            ? html`
                  <label for="${id}"
                      >${text}
                      ${this.devInfo(
                          context,
                          context.elementDefinition.element_type.text,
                          context.elementDefinition.element_type.value,
                      )}
                  </label>
              `
            : this.devInfo(
                  context,
                  context.elementDefinition.element_type.text,
                  context.elementDefinition.element_type.value,
              )
    }

    static render(context: UIElementRenderContext, id: string) {
        try {
            const value = this.resolve(context, context.elementDefinition.element_type.value)
            if (!this.isVisible(context, value)) {
                return html`${nothing}`
            }
            let text = this.resolve(context, context.elementDefinition.element_type.text)
            const htmlClass = this.getStyleSetting(
                context.elementDefinition.element_type,
                'classes',
                '',
            )
            const cssStyle = this.addStyle(
                '',
                this.getStyleTextAlign(context.elementDefinition.element_type),
            )
            const ts = DateTime.fromISO(value)
            let tsValue: string | undefined = undefined
            if (ts.isValid) {
                if (
                    ((context.elementDefinition.element_type as UISchemaDateTimeField)
                        .date_format || 'latin') === 'latin'
                ) {
                    tsValue = getLatinDate(ts, false)
                } else {
                    tsValue = ts.toLocaleString(DateTime.DATE_SHORT)
                }
            }

            return context.parentLayout.renderElement(
                context.elementDefinition.layout,
                html`
                    ${this.renderLabel(context, id, text)}
                    ${context.elementDefinition.element_type.readonly
                        ? html`<input id=${id} name=${id}
                                    class="input-right-align ${htmlClass}"
                                    style="${cssStyle}"
                                    value="${tsValue || nothing}"
                                    @change="${context.uicomponent.fieldChanged}"
                                    ?disabled=${context.elementDefinition.element_type.readonly}>
                        </input>`
                        : html` <vaadin-date-picker
                              id=${id}
                              name=${id}
                              class="${htmlClass || nothing}"
                              style="${cssStyle || nothing}"
                              value="${tsValue || nothing}"
                              @change="${context.uicomponent.fieldChanged}"
                              ?disabled=${!context.elementDefinition.element_type.enabled}
                          >
                          </vaadin-date-picker>`}
                `,
            )
        } catch (e) {
            console.error(`datefield.render: ${e as string} with context`, context)
            throw e
        }
    }
}
