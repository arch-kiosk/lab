import { UIElement } from '#src/uielement'
import { nothing, html, TemplateResult } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { directive, Directive, PartInfo } from 'lit/directive.js'

import '@vaadin/select'
import type { Select } from '@vaadin/select'

import {
    UISchemaDropDownSelection,
} from '#src/uischema'

import { UIElementRenderContext } from '#src/uielementrendercontext'
import {
    TemplateResultOrNothing,
    UIElementDataChangedEvent,
    UIElementLookupListItem,
} from '#src/sharedtypes'
import { DataProviderValidationResult } from '@arch-kiosk/appfoundation/dataprovider'
import { UILayout } from '#src/layouts/uilayout'
import { UIComponent } from '#src/uicomponent'


class TopicOptionsDirective extends Directive {
    private id?: string
    private topic?: string
    private cachedTemplates?: TemplateResult[]

    constructor(partInfo: PartInfo) {
        super(partInfo)
    }

    render(id: string, topic: string, uiComponent: UIComponent): TemplateResult[] {
        if (this.id !== id || this.topic !== topic || !this.cachedTemplates) {
            this.id = id
            this.topic = topic

            const rawItems: UIElementLookupListItem[] =
                uiComponent.getLookupList(topic) ?? []

            this.cachedTemplates = rawItems.map(
                (item) => html`
                    <vaadin-select-item
                            .value=${item.value}
                            .label=${item.label}
                    >
                        ${item.label}
                    </vaadin-select-item>
                `,
            )
        }

        return this.cachedTemplates
    }
}

const renderTopicOptions = directive(TopicOptionsDirective)


export class UIElementDropDownSelection extends UIElement {

    static renderSkeleton(context: UIElementRenderContext, id: string) {
        return this.renderElement(context, id, true)
    }

    static checkElementDefinition(
        id: string,
        context: UIElementRenderContext,
    ): UISchemaDropDownSelection {
        if (!context.parentLayout)
            throw new Error(
                context.uicomponent.i18NST(
                    'uic.missing_parent_layout',
                    '{{ui_element_name}}: render context is missing parentLayout',
                    [id],
                ),
            )

        if (context.elementDefinition.element_type !== 'drop-down-selection')
            throw new Error(
                context.uicomponent.i18NST(
                    'uic.wrong_element_type',
                    '{{ui_element_name}}: render called with wrong element type {{element_type}}',
                    [id, context.elementDefinition.element_type],
                ),
            )

        return context.elementDefinition
    }

    static onStaticSelectionChanged(
        e: CustomEvent,
        oldDbValue: string | undefined,
    ) {
        const element = e.currentTarget as Select

        e.stopPropagation()

        const newDbValue = e.detail.value as string

        if (oldDbValue !== newDbValue) {
            if (!newDbValue) {
                console.error(
                    `UIElementDropDownSelection.onValueChanged NULL value!`,
                )
                element.value = oldDbValue ?? ''
                return
            }

            console.log(
                `new drop down selection dbValue is ${newDbValue}`,
            )

            try {
                element.dispatchEvent(
                    new UIElementDataChangedEvent({
                        htmlId: element.id,
                        value: newDbValue,
                    }),
                )
            } catch (err) {
                console.error(
                    `UIElementDropDownSelection.onStaticSelectionChanged threw exception ${err} in event`,
                    err,
                )
            }
        }
    }


    static renderWithStaticSelection(
        context: UIElementRenderContext,
        elementDefinition: UISchemaDropDownSelection,
        id: string,
        dbValue: string | undefined,
        parentLayout: UILayout,
        text: string,
        validationInfo: {
            hasError: boolean
            results: DataProviderValidationResult[] | undefined
        } | undefined,
        cssClasses: string[],
        cssStyles: Record<string, string>,
    ): TemplateResultOrNothing {

        if (validationInfo?.hasError) {
            cssStyles['border'] = '1px dotted red'
        }

        parentLayout.adjustElementStyles({
            cssClasses: cssClasses,
            cssStyles: cssStyles,
        })

        const isReadOnly =
            !(elementDefinition.enabled ?? true) ||
            (elementDefinition.readonly ?? false)

        if (!this.isVisible(context, id, dbValue) && isReadOnly) {
            return nothing
        }

        const topic: string | undefined =
            (elementDefinition.items &&
                typeof elementDefinition.items === 'object' &&
                'topic' in elementDefinition.items)
                ? elementDefinition.items.topic
                : undefined

        const scopedId = context.getScopedId(id)

        return parentLayout.renderElement(
            elementDefinition,
            {
                cssClasses: cssClasses,
                cssStyles: cssStyles,
            },
            (erc) => html`
                ${parentLayout.renderLabel(
                        context,
                        id,
                        text,
                        validationInfo?.hasError,
                )}

                <vaadin-select
                        id=${scopedId}
                        .value=${dbValue || ''}
                        class=${erc.cssClasses.join(' ')}
                        style=${styleMap(erc.cssStyles)}
                        @value-changed=${(e: CustomEvent) =>
                                this.onStaticSelectionChanged(e, dbValue)}
                        @keyup=${context.uicomponent.keyupOnElement}
                        ?disabled=${!(elementDefinition.enabled ?? true) || isReadOnly}
                >
                    <vaadin-select-list-box slot="overlay">
                        ${
                                topic
                                        ? renderTopicOptions(
                                                scopedId,
                                                topic,
                                                context.uicomponent,
                                        )
                                        : (
                                                Array.isArray(elementDefinition.items)
                                                        ? elementDefinition.items
                                                        : []
                                        ).map((item) => {
                                            const [value, label] =
                                                    typeof item === 'string'
                                                            ? [item, item]
                                                            : item

                                            return html`
                                                <vaadin-select-item
                                                        .value=${value}
                                                        .label=${label}
                                                >
                                                    ${label}
                                                </vaadin-select-item>
                                            `
                                        })
                        }
                    </vaadin-select-list-box>
                </vaadin-select>
            `,
        )
    }

    static renderElement(
        context: UIElementRenderContext,
        id: string,
        skeleton = false,
    ): TemplateResultOrNothing {

        // ============================================
        // First of all: prepare what is needed for the rendering part
        // ============================================

        const elementDefinition = this.checkElementDefinition(id, context)
        const parentLayout = context.parentLayout!

        let [dbValue, text] = this.batchResolve(
            context,
            [
                `\${${elementDefinition.binding.field_name}}`,
                elementDefinition.text,
            ],
            id,
        ) as [string | undefined, string]

        const validationInfo = skeleton
            ? undefined
            : this.getValidationInfo(
                context,
                elementDefinition.binding.field_name,
            )

        const cssClasses = this.getCSSClasses(
            context,
            elementDefinition.style?.css_classes,
        )

        const cssStyles = this.getCSSStyles(
            context,
            elementDefinition.style?.css_styles,
        )

        if (skeleton) {
            // render the skeleton representation

            cssClasses.push('skeleton')

            return parentLayout.renderElement(
                elementDefinition,
                {
                    cssClasses: cssClasses,
                    cssStyles: cssStyles,
                },
                (erc) => html`
                    ${parentLayout.renderLabel(
                            context,
                            id,
                            text,
                            validationInfo?.hasError,
                    )}

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
            const parameters = [
                context,
                elementDefinition,
                id,
                dbValue,
                parentLayout,
                text,
                validationInfo,
                cssClasses,
                cssStyles,
            ] as const

            return this.renderWithStaticSelection(...parameters)
        }
    }
}
