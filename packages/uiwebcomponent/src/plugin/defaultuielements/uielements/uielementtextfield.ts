import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'

import {
    UISchemaTextField,

} from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'
import { TemplateResultOrNothing } from '#src/sharedtypes'

export class UIElementTextField extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    static checkElementDefinition(id: string, context: UIElementRenderContext): UISchemaTextField {
        if (!context.parentLayout)
            throw context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id])
        if (context.elementDefinition.element_type !== 'text_field')
            throw context.uicomponent.i18NST('uic.wrong_element_type', '{{ui_element_name}}: render called with wrong element type {{element_type}}', [id, context.elementDefinition.element_type])

        return context.elementDefinition
    }

    // static getValidationInfo(context: UIElementRenderContext, id: string) {
    //     const validationInfo = {
    //         hasError: false,
    //         results: context.getFieldValidationInfo(id),
    //     }
    //     validationInfo.hasError = Boolean(
    //         validationInfo.results
    //         && validationInfo.results.find((v) => v.result === 'error'),
    //     )
    //     return validationInfo
    // }

    static renderElement(context: UIElementRenderContext, id: string, skeleton = false): TemplateResultOrNothing {

        /* ============================================
           First of all: prepare what is needed for the rendering part
           ============================================ */

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!

        let [value, text] = this.batchResolve(
            context,
            [elementDefinition.value, elementDefinition.text],
            id
        ) as [string | undefined, string]

        if (!this.isVisible(context, id, value)) {
            return nothing
        }

        const validationInfo = skeleton ? undefined : this.getValidationInfo(context, elementDefinition.binding.field_name)

        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)

        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)

        const isIdentifier = this.isIdentifier(context)

        if (isIdentifier) {
            cssClasses.push('identifier-link')
        }

        if (skeleton) {
            cssClasses.push('skeleton')
        }

        const maskIdentifier = this.maskIdentifier(context, elementDefinition.display_identifier)
        const maskedValue = maskIdentifier? this.resolve(context, maskIdentifier, id) : null

        if (validationInfo?.hasError) {
            cssStyles["border"] = "1px dotted red"
        }

        if (
            elementDefinition.ellipsis?.max_characters &&
            typeof value === 'string' &&
            value.length > elementDefinition.ellipsis.max_characters
        ) {
            value = value.slice(0, Math.max(0, elementDefinition.ellipsis.max_characters - 2)) + '..'
        }

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )

        const isReadOnly =
            !(elementDefinition.enabled ?? true) ||
            (elementDefinition.readonly ?? false) ||
            skeleton

        /* ============================================
            Enough preparation, let's render.
        ============================================ */

        if (elementDefinition.multiline && isReadOnly) {
            //todo: I don't like this in the ui-component. The dataprovider must do this if necessary
            //if (typeof value === 'string') {
            //     value = value.replaceAll('\r\n', '\n')
            //     value = value.replaceAll('\r', '\n')
            // }
                cssClasses.push("multiline-textarea", "read-only-textarea")
                return parentLayout.renderElement(
                    elementDefinition,
                    {
                        cssClasses: cssClasses,
                        cssStyles: cssStyles
                    },
                    (erc) => html`
                        ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                        <div
                                style=${styleMap(erc.cssStyles)}
                                id=${context.getScopedId(id)}
                                class=${erc.cssClasses.join(' ')}
                        >
                            ${value || nothing}
                        </div>
                    `,
                )
            }

        if (elementDefinition.multiline && !isReadOnly) {
            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles
                },
                (erc) => html`
                    ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                    <textarea
                        id=${context.getScopedId(id)}
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                    >${value ?? ''}</textarea>
                `,
            )
        }

        // read-only input field (not a multiline)
        if (!elementDefinition.multiline && isReadOnly) {
            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles
                },
                (erc) => html`
                    ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                    <div
                            style=${erc.cssStyles.length?styleMap(erc.cssStyles):nothing}
                            id=${context.getScopedId(id)}
                            class="read-only-textarea ${erc.cssClasses.join(" ")}"
                            data-identifier=${isIdentifier ? value : nothing}
                            @click=${isIdentifier
                                    ? context.uicomponent.gotoIdentifier
                                    : nothing}
                    >
                            <span>${isIdentifier
                                    ? html`<i class="footsteps"></i>`
                                    : nothing}${isIdentifier && maskedValue
                                    ? maskedValue || nothing
                                    : html`${value || nothing}`}
                            </span>
                    </div>`
            )
        }

        // normal, active input field
        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
            (erc) => html`
                ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                <input
                        id=${context.getScopedId(id)}
                        type="text"
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        value=${value ?? ''}
                        ?disabled=${!(elementDefinition.enabled ?? true) ||
                        elementDefinition.readonly}/>
            `,
        )
    }
}
