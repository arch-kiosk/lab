import { UIElement } from '#src/uielement'
import { nothing, html } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import "@vaadin/combo-box"

import {
    UISchemaComboBox,
} from '#src/uischema'

import { UIElementRenderContext } from '#src/uielementrendercontext'
import {
    TemplateResultOrNothing,
    UIElementDataChangedEvent,
    UIElementLookupListItem,
} from '#src/sharedtypes'
import { DataProviderValidationResult } from '@arch-kiosk/appfoundation/dataprovider'
import { UILayout } from '#src/layouts/uilayout'
import { ComboBox,type ComboBoxDataProvider} from '@vaadin/combo-box'
import { directive, Directive, PartInfo, PartType } from 'lit/directive.js';
import { UIComponent } from '#src/uicomponent'

class DataProviderDirective extends Directive {
    private id?: string;
    private provider?: ComboBoxDataProvider<UIElementLookupListItem>;

    constructor(partInfo: PartInfo) {
        super(partInfo);
        if (partInfo.type !== PartType.PROPERTY || partInfo.name !== 'dataProvider') {
            throw new Error('dataProviderDirective must be bound to .dataProvider property');
        }
    }

    render(id: string, topic: string, uiComponent: UIComponent): ComboBoxDataProvider<UIElementLookupListItem> {
        if (this.id !== id || !this.provider) {
            this.id = id;

            // Synchronous dataProvider closure
            this.provider = (params, callback) => {
                const items = uiComponent.getLookupList(topic, params)
                callback(items ?? [], items?.length ?? 0)
            };
        }

        return this.provider;
    }
}

const createProviderFor = directive(DataProviderDirective);

export class UIElementComboBox extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    static checkElementDefinition(id: string, context: UIElementRenderContext): UISchemaComboBox {
        if (!context.parentLayout)
            throw new Error(context.uicomponent.i18NST('uic.missing_parent_layout', '{{ui_element_name}}: render context is missing parentLayout', [id]))
        if (context.elementDefinition.element_type !== 'combo-box')
            throw new Error(context.uicomponent.i18NST('uic.wrong_element_type', '{{ui_element_name}}: render called with wrong element type {{element_type}}', [id, context.elementDefinition.element_type]))

        return context.elementDefinition
    }

    static onStaticSelectionChanged(e:CustomEvent, oldDisplayValue: string, elementDefinition: UISchemaComboBox) {
        const element = e.currentTarget as ComboBox
        e.stopPropagation()
        if (oldDisplayValue !== e.detail.value) {
            if (!Array.isArray(elementDefinition.items)) throw new Error("internal error onStaticSelectionChanged: not an Array?")
            let dbValue: string | undefined = undefined
            if (!e.detail.value) {
                console.error(`UIElementComboBox.onValueChanged NULL value!`)
                e.detail.value = oldDisplayValue
                element.value = oldDisplayValue

            }
            for (const item of elementDefinition.items) {
                const itemText = Array.isArray(item) ? (item.length > 1 ? item[1] : item[0]) : item
                if (e.detail.value === itemText) dbValue = Array.isArray(item) ? item[0] : item
            }
            if (dbValue) {
                console.log(`new combobox dbValue is ${dbValue}`)
                try {
                    element.dispatchEvent(new UIElementDataChangedEvent({
                        htmlId: element.id,
                        value: dbValue}
                    ));
                } catch(e) {
                    console.error(`UIElementComboBox.onStaticSelectionChanged threw exception ${e} in event ${e}`, )
                }
            } else {

            }

        }
        return
    }

    static renderWithStaticSelection(
                          context: UIElementRenderContext,
                          elementDefinition: UISchemaComboBox,
                          id: string,
                          dbValue: string | undefined,
                          parentLayout: UILayout,
                          text: string,
                          validationInfo: {
                              hasError: boolean
                              results: DataProviderValidationResult[] | undefined
                          } | undefined,
                          cssClasses: string[],
                          cssStyles: Record<string, string>):TemplateResultOrNothing {
        const listItems: string[] = []
        let displayValue: string | undefined = undefined
        if (Array.isArray(elementDefinition.items)) {
            //used only as a typescript type guard here
            for (const item of elementDefinition.items) {
                const itemText = Array.isArray(item) ? (item.length > 1 ? item[1] : item[0]) : item
                const itemValue = Array.isArray(item) ? item[0] : item
                listItems.push(itemText)
                if (dbValue === itemValue) {
                    displayValue = itemText
                }
            }
            if (dbValue && !displayValue) {
                displayValue = `? ${dbValue}`
            }
        }

        if (validationInfo?.hasError) {
            cssStyles["border"] = "1px dotted red"
        }

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )

        const isReadOnly =
            !(elementDefinition.enabled ?? true) ||
            (elementDefinition.readonly ?? false)

        if (!this.isVisible(context, id, dbValue) && isReadOnly) {
            return nothing
        }

        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
            (erc) => html`
                ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                <vaadin-combo-box
                        id=${context.getScopedId(id)}
                        .items="${listItems}"
                        .selectedItem="${displayValue || nothing}"
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        @value-changed=${(e: CustomEvent) => this.onStaticSelectionChanged(e, displayValue ?? '',elementDefinition)}
                        @keyup="${context.uicomponent.keyupOnElement}"
                        ?disabled=${!(elementDefinition.enabled ?? true) || isReadOnly}/>
            `,
        )
    }

    static onDynamicSelectionChanged(e:CustomEvent) {
        const element = e.currentTarget as ComboBox
        console.log("dynamic selection changed", e)
        e.stopPropagation()
        const dbValue = e.detail.value

        if (dbValue !== element.dataset.value) {
            console.log(`new combobox dbValue is ${dbValue}`)
            try {
                element.dispatchEvent(new UIElementDataChangedEvent({
                    htmlId: element.id,
                    value: dbValue}
                ));
            } catch(e) {
                console.error(`UIElementComboBox.onDynamicSelectionChanged threw exception ${e} in event ${e}`, )
            }
        } else {

        }
    }

    static renderWithDynamicSelection(
                          context: UIElementRenderContext,
                          elementDefinition: UISchemaComboBox,
                          id: string,
                          dbValue: string | undefined,
                          parentLayout: UILayout,
                          text: string,
                          validationInfo: {
                              hasError: boolean
                              results: DataProviderValidationResult[] | undefined
                          } | undefined,
                          cssClasses: string[],
                          cssStyles: Record<string, string>):TemplateResultOrNothing {
        let displayValue: string | undefined = undefined
        if (!context.uicomponent.lookupProvider) {
            throw new Error(context.uicomponent.i18NST('uic.dynamic_selection_without_lookup_provider', 'Element {{ui_element_name}}: UIElementComboBox.renderWithDynamicSelection called without a lookup provider in place.', [id]))
        }
        if (!("topic" in elementDefinition.items)) return nothing
            //used only as a typescript type guard here

        displayValue = context.uicomponent.lookup(elementDefinition.items.topic, dbValue)

        if (validationInfo?.hasError) {
            cssStyles["border"] = "1px dotted red"
        }

        parentLayout.adjustElementStyles({
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
        )

        const isReadOnly =
            !(elementDefinition.enabled ?? true) ||
            (elementDefinition.readonly ?? false)

        if (!this.isVisible(context, id, dbValue) && isReadOnly) {
            return nothing
        }

        const topic=elementDefinition.items.topic

        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles
            },
            (erc) => html`
                ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                <vaadin-combo-box
                        id=${context.getScopedId(id)}
                        .selectedItem="${{value: dbValue || nothing, label: displayValue}}"
                        value="${dbValue}"
                        data-value="${dbValue}"
                        item-label-path="label"
                        item-value-path="value"
                        item-id-path="value"
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        @keyup=${context.uicomponent.keyupOnElement}
                        @value-changed=${this.onDynamicSelectionChanged}
                        .dataProvider=${createProviderFor(id, topic, context.uicomponent)}
                        ?disabled=${!(elementDefinition.enabled ?? true) || isReadOnly}/>
            `,
        )
    }

    static renderElement(context: UIElementRenderContext, id: string, skeleton = false): TemplateResultOrNothing {

        /* ============================================
           First of all: prepare what is needed for the rendering part
           ============================================ */

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!
        let [dbValue, text] = this.batchResolve(
            context,
            [`\${${elementDefinition.binding.field_name}}`,
                elementDefinition.text],
            id
        ) as [string | undefined, string]

        const validationInfo = skeleton ? undefined : this.getValidationInfo(context, elementDefinition.binding.field_name)

        const cssClasses = this.getCSSClasses(context, elementDefinition.style?.css_classes)

        const cssStyles = this.getCSSStyles(context, elementDefinition.style?.css_styles)


        if (skeleton) {
            // render the skeleton representation
            cssClasses.push('skeleton')
            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles
                },
                (erc) => html`
                ${parentLayout.renderLabel(context, id, text, validationInfo?.hasError)}
                <div
                        id=${context.getScopedId(id)}
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                >
                    ${dbValue ?? ''}                    
                </div>
            `,
            )
        } else {
            const parameters= [context,
                elementDefinition,
                id,
                dbValue,
                parentLayout,
                text,
                validationInfo,
                cssClasses,
                cssStyles] as const
            //render according to the type of selection
            if (elementDefinition.items && Array.isArray(elementDefinition.items)) {
                return this.renderWithStaticSelection(...parameters)
            }
            if (elementDefinition.items && 'topic' in elementDefinition.items) {
                return this.renderWithDynamicSelection(...parameters)
            }
        }

        // no correct list definition found
        throw context.uicomponent.i18NST('uic.list_definition_missing', '{{ui_element_name}}: no list definition given for selection element.', [id])
    }
}
