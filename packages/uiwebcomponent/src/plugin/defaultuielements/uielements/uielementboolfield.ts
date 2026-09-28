import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { UIElementRenderContext } from '#src/uielementrendercontext'

export class UIElementBoolField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return context.parentLayout.renderElementLabels
            ? html`
                  <label for="${id}"
                      >${text ? text : nothing}
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
            let value = this.resolve(context, context.elementDefinition.element_type.value, id)

            if (!this.isVisible(context, value)) {
                return html`${nothing}`
            }
            let text = this.resolve(context, context.elementDefinition.element_type.text)
            let htmlClass = this.getStyleSetting(
                context.elementDefinition.element_type,
                'classes',
                '',
            )
            let cssStyle = this.addStyle(
                '',
                this.getStyleTextAlign(context.elementDefinition.element_type),
            )
            if (context.elementDefinition.layout?.max_height) {
                cssStyle = this.addStyle(
                    cssStyle,
                    `max-height: ${context.elementDefinition.layout.max_height === 'max' ? 'none' : context.elementDefinition.layout.max_height + 'em'}`,
                )
            }

            if (context.elementDefinition.element_type.readonly) {
                return context.parentLayout.renderElement(
                    context.elementDefinition.layout,
                    html`
                        ${this.renderLabel(context, id, text)}
                        <div
                            style="${cssStyle ? cssStyle : nothing}"
                            id=${id}
                            class="read-only-textarea ${htmlClass}"
                        >
                            <span><span>${value ? 'YES' : 'NO'}</span></span>
                        </div>
                    `,
                )
            } else {
                htmlClass = htmlClass ? htmlClass + ' input-checkbox' : 'input-checkbox'
                return context.parentLayout.renderElement(
                    context.elementDefinition.layout,
                    html`
                        ${this.renderLabel(context, id, text)}
                        <input
                            id=${id}
                            name=${id}
                            type="checkbox"
                            class="${htmlClass}"
                            style="${cssStyle ? cssStyle : nothing}"
                            ?checked="${!!value}"
                            @change="${context.uicomponent.fieldChanged}"
                            ?disabled=${!context.elementDefinition.element_type.enabled}
                        />
                    `,
                )
            }
        } catch (e) {
            console.error(`textfield.render: ${e as string} with context`, context)
            throw e
        }
    }
}
