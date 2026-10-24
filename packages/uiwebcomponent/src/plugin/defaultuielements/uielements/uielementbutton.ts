import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'

import {
    UISchemaButton

} from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'
import { TemplateResultOrNothing } from '#src/sharedtypes'

export class UIElementButton extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    static checkElementDefinition(id: string, context: UIElementRenderContext): UISchemaButton {
        if (!context.parentLayout)
            throw context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id])
        if (context.elementDefinition.element_type !== 'button')
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

    static onClickEvent(e: Event) {
        if ('currentTarget' in e) {
            const id = (<HTMLElement>e.currentTarget).id
            alert(`button ${id} clicked`)
        }

    }

    static renderElement(context: UIElementRenderContext, id: string, skeleton = false): TemplateResultOrNothing {

        /* ============================================
           First of all: prepare what is needed for the rendering part
           ============================================ */

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!

        // let [value, text] = this.batchResolve(
        //     context,
        //     [elementDefinition.value, elementDefinition.text],
        //     id
        // ) as [string | undefined, string]

        if (!this.isVisible(context, id)) {
            return nothing
        }

        // const validationInfo = skeleton ? undefined : this.getValidationInfo(context, elementDefinition.binding.field_name)

        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)

        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)


        if (skeleton) {
            cssClasses.push('skeleton')
        }

        // if (validationInfo?.hasError) {
        //     cssStyles["border"] = "1px dotted red"
        // }


        let buttonText = ''
        cssClasses.push("modal-button")
        switch (elementDefinition.button_type) {
            case 'cancelButton':
                cssClasses.push('modal-cancel')
                break
            case 'okButton':
                cssClasses.push('modal-ok')
                break
            case 'iconButton':
                cssClasses.push('modal-round-button')
                buttonText = (context.resolve(elementDefinition.icon!, id) ?? "") as string
                break
            default:
                break
        }

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )


        const enabled = this.isEnabled(context, id)

        /* ============================================
            Enough preparation, let's render.
        ============================================ */
        // normal, active input field
        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
            (erc) => html`
                <button
                        id=${id}
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        @click=${this.onClickEvent}
                        ?disabled=${!enabled}
                >
                    ${buttonText}
                </button>
            `,
        )
    }
}
