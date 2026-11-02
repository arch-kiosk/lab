import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'

import {
    UISchemaLine

} from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'
import { TemplateResultOrNothing } from '#src/sharedtypes'

export class UIElementLine extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id)
    }

    static checkElementDefinition(id: string, context: UIElementRenderContext): UISchemaLine {
        if (!context.parentLayout)
            throw context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id])
        if (context.elementDefinition.element_type !== 'line')
            throw context.uicomponent.i18NST('uic.wrong_element_type', '{{ui_element_name}}: render called with wrong element type {{element_type}}', [id, context.elementDefinition.element_type])

        return context.elementDefinition
    }

    static renderElement(context: UIElementRenderContext, id: string): TemplateResultOrNothing {

        /* ============================================
           First of all: prepare what is needed for the rendering part
           ============================================ */

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!

        if (!this.isVisible(context, id)) {
            return nothing
        }

        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)
        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )
        cssClasses.push(elementDefinition.transparent?"ui-line-transparent":"ui-line")
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
                <div id="${id}"
                     class=${erc.cssClasses.join(' ')}
                     style=${styleMap(erc.cssStyles)}
                >
                </div>
            `,
        )
    }
}
