import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { UISchemaTextField, UISchemaBoundUIElement } from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'

export class UIElementTextField extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string, errorState=false) {
        return context.parentLayout?.renderElementLabels
            ? html`
                  <label for="${context.getScopedId(id)}" style="${errorState?'color: red':nothing}"
                      >${text ? text : nothing}
                      ${this.devInfo(
                          context,
                          context.elementDefinition.text,
                          context.elementDefinition.value,
                      )}
                  </label>
              `
            : this.devInfo(context, context.elementDefinition.text, context.elementDefinition.value)
    }

    static render(context: UIElementRenderContext, id: string) {
        if (!context.parentLayout)
            throw 'UIElementTextField.render: render context is missing parentLayout'
        try {
            let resolvedValues = this.batchResolve(
                context, [
                    context.elementDefinition.value,
                    context.elementDefinition.text],
                id) as Array<string|undefined>
            let value = resolvedValues[0]
            let maskedValue = null

            if (!this.isVisible(context, value, id)) {
                if (id.startsWith("uid")) console.error(`  textfield ${context.getScopedId(id)} not visible anymore`)
                return html`${nothing}`
            }
            const validationInfo = context.getFieldValidationInfo(id)
            let errState = Boolean(validationInfo && validationInfo.find((v) => v.result === "error"))

            if (id.startsWith("uid")) console.error(`  textfield ${context.getScopedId(id)} still visible`)
            let text = resolvedValues[1]!
            let htmlClass = this.getStyleSetting(
                context.elementDefinition,
                'classes',
                '',
            )
            let cssStyle = this.addStyle(
                '',
                this.getStyleTextAlign(context.elementDefinition.element_type),
            )
            let isIdentifier = this.isIdentifier(context)
            if (context.elementDefinition.layout?.max_height) {
                cssStyle = this.addStyle(
                    cssStyle,
                    `max-height: ${context.elementDefinition.layout.max_height === 'max' ? 'none' : context.elementDefinition.layout.max_height + 'em'}`,
                )
            }
            if (this.isIdentifier(context)) {
                htmlClass = (htmlClass ? ' ' : '') + 'identifier-link'
            }
            if (this.maskIdentifier(context)) {
                maskedValue = this.resolve(context, this.maskIdentifier(context), id)
            }
            if (errState) {
                cssStyle = this.addStyle(
                    cssStyle,
                    `border: 1px dotted red`,
                )
            }
            if (context.elementDefinition.max_characters) {
                if (
                    typeof value === 'string' &&
                    value.length > context.elementDefinition.max_characters
                ) {
                    value =
                        value
                            .slice(0, context.elementDefinition.max_characters)
                            .trim()
                            .split(' ')
                            .slice(0, -1)
                            .join(' ') + '..'
                    console.log('value', value)
                }
            }
            if ((context.elementDefinition as UISchemaTextField).multiline) {
                if (typeof value === 'string') {
                    value = value.replaceAll('\r\n', '\n')
                    value = value.replaceAll('\r', '\n')
                }
                if (!context.elementDefinition.enabled || (context.elementDefinition as UISchemaBoundUIElement).readonly) {
                    return context.parentLayout.renderElement(
                        context.elementDefinition.layout,
                        html`
                            ${this.renderLabel(context, id, text, errState)}
                            <div
                                    style="${cssStyle ? cssStyle : nothing}"
                                    id="${context.getScopedId(id)}"
                                    class="multiline-textarea read-only-textarea ${htmlClass}">
                                ${value || nothing}
                            </div>
                        `,
                    )
                } else {
                    return context.parentLayout.renderElement(
                        context.elementDefinition.layout,
                        html`
                            ${this.renderLabel(context, id, text, errState)}
                            <textarea
                                    id=${context.getScopedId(id)}
                                    class="${htmlClass}"
                                    style="${cssStyle ? cssStyle : nothing}">
                                ${value || nothing}
                            </textarea>
                        `,
                    )
                }
            } else {
                if (!context.elementDefinition.enabled || (context.elementDefinition as UISchemaBoundUIElement).readonly) {
                    return context.parentLayout.renderElement(
                        context.elementDefinition.layout,
                        html`
                            ${this.renderLabel(context, id, text, errState)}
                            <div
                                style="${cssStyle ? cssStyle : nothing}"
                                id=${context.getScopedId(id)}
                                class="read-only-textarea ${htmlClass}"
                                data-identifier="${isIdentifier ? value : nothing}"
                                @click="${isIdentifier
                                    ? context.uicomponent.gotoIdentifier
                                    : nothing}">
                                <span>${isIdentifier
                                        ? html`<i class="footsteps"></i>`
                                        : nothing}${isIdentifier && maskedValue
                                        ? maskedValue || nothing
                                        : html`${value || nothing}`}
                                </span>
                            </div>
                        `,
                    )
                } else {
                    return context.parentLayout.renderElement(
                        context.elementDefinition.layout,
                        html`
                            ${this.renderLabel(context, id, text, errState)}
                            <input
                                id=${context.getScopedId(id)}
                                type="text"
                                class="${htmlClass}"
                                style="${cssStyle ? cssStyle : nothing}"
                                value="${value || nothing}"
                                ?disabled=${!context.elementDefinition.enabled ||
                                (context.elementDefinition as UISchemaBoundUIElement).readonly}/>
                        `,
                    )
                }
            }
        } catch (e) {
            console.error(`textfield.render: ${e as string} with context`, context)
            throw e
        }
    }
}
