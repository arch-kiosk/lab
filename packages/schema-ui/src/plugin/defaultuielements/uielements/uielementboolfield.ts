import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'

import {
    UISchemaBoolField,

} from '#src/uischema'
import { UIElementRenderContext } from '#src/uielementrendercontext'
import { TemplateResultOrNothing, UIElementDataChangedEvent } from '#src/sharedtypes'

export class UIElementBoolField extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    /**
     * retrieves the current value from the DOM Input element.
     * @param _elementId: Unused here
     * @param domElement: The HTMLElement from which to retrieve the input
     * @returns either undefined or a boolean value
     */
    static getDomValue(_elementId: string, domElement: HTMLElement) {
        if (domElement instanceof HTMLInputElement && domElement.type === "checkbox") {
            return domElement.checked
        }
        return undefined
    }

    static checkElementDefinition(id:string, context: UIElementRenderContext): UISchemaBoolField {
        if (!context.parentLayout)
            throw context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id])
        if (context.elementDefinition.element_type !== 'bool')
            throw context.uicomponent.i18NST('uic.wrong_element_type', '{{ui_element_name}}: render called with wrong element type {{element_type}}', [id, context.elementDefinition.element_type])
        return context.elementDefinition
    }

    static onDataChanged(e:CustomEvent) {
        const element = e.currentTarget as HTMLInputElement
        e.stopPropagation()
        try {
                element.dispatchEvent(new UIElementDataChangedEvent({
                    htmlId: element.id,
                    value: element.checked}
                ));
        } catch(e) {
            console.error(`UIElementBoolField.onValueChanged threw exception ${e} in event ${e}`, )
        }
    }

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
        ) as [boolean | undefined, string]
        if (!this.isVisible(context, id, value)) {
            return nothing
        }

        const validationInfo = skeleton ? undefined : this.getValidationInfo(context, elementDefinition.binding.field_name)

        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)

        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)

        if (skeleton) {
            cssClasses.push('skeleton')
        }


        if (validationInfo?.hasError) {
            cssStyles["accent-color"] = "red"
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

        // up to here it is all boilerplate
        // now come the element_type - specific settings


        /* ============================================
            Enough preparation, let's render.
        ============================================ */

        // render read only checkbox
        if (isReadOnly) {
            // cssClasses.push("read-only-textarea")
            const value_text = value
                ? context.uicomponent.i18NST("uic.yes", "yes", [])
                : context.uicomponent.i18NST("uic.no", "no", [])
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
                    <span>
                        ${skeleton ? "" : value_text.toLocaleUpperCase(context.uicomponent.currentLocale)}
                    </span>                    
                </div>
            `,
            )
        }
        cssClasses.push('input-checkbox')
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
                        type="checkbox"
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        @change="${this.onDataChanged}"
                        ?checked=${value}
                        ?disabled=${!(elementDefinition.enabled ?? true)}
                />
                
            `,
        )
    }
}
