import { UIElement } from '#src/uielement'
import { UIElementRenderContext } from '#src/uielementrendercontext'

// import {html} from "lit/static-html.js";
import { nothing, html } from 'lit'

export class UIElementTemplateLabel extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return context.parentLayout.renderElementLabels &&
            context.elementDefinition.element_type.text
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
            : nothing
    }

    static render(context: UIElementRenderContext, id: string) {
        const value = this.resolve(context, context.elementDefinition.element_type.value)
        if (!this.isVisible(context, value)) {
            return html`${nothing}`
        }
        const text = this.resolve(context, context.elementDefinition.element_type.text)
        const htmlClass = this.getStyleSetting(
            context.elementDefinition.element_type,
            'classes',
            '',
        )
        const cssStyle = this.addStyle(
            '',
            this.getStyleTextAlign(context.elementDefinition.element_type),
        )
        this.addStyle(
            cssStyle,
            context.uicomponent
                .getPaddingStyle(context.elementDefinition.layout?.padding)
                .replace('padding', 'margin'),
        )
        return context.parentLayout.renderElement(
            context.elementDefinition.layout,
            html`
                ${this.renderLabel(context, id, text)}
                <div
                    class="templateLabel ${htmlClass}"
                    id=${id}
                    style="${cssStyle ? cssStyle : nothing}"
                >
                    ${this.devInfo(
                        context,
                        context.elementDefinition.element_type.text,
                        context.elementDefinition.element_type.value,
                    )}${value || nothing}
                </div>
            `,
        )
    }
}
