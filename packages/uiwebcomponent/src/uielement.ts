// oxlint-disable typescript/no-redundant-type-constituents
import {
    ApiTimeZoneInfo,
    InterpretedExpression,
    UISchemaBaseUIElement, UISchemaIdentifierDisplay, UISchemaLayoutPadding,
    UISchemaTextField,
} from '#src/uischema'
import { html, TemplateResult, nothing } from 'lit'
import {type TemplateResultOrNothing} from './sharedtypes'
import { UIElementRenderContext } from '#src/uielementrendercontext'

export class UIElement {
    // eslint-disable-next-line typescript/no-explicit-any
    static resolve(context: UIElementRenderContext, expression?: string, id?: string): unknown | undefined {
        return expression ? context.resolve(expression, id) : undefined
    }

    static batchResolve(context: UIElementRenderContext, expressions?: Array<string|undefined>, id?: string): Array<unknown> | undefined {
        return expressions ? context.resolve(expressions, id) as Array<unknown | undefined> : undefined
    }

    static getTimeZoneInfo(
        context: UIElementRenderContext,
        tzIndex: number,
    ): ApiTimeZoneInfo | undefined {
        return context.getTimeZoneInfo(tzIndex)
    }

    static renderSkeleton(_context: UIElementRenderContext, id: string): TemplateResultOrNothing {
        return html``
    }

    static renderElement(_context: UIElementRenderContext, id: string): TemplateResultOrNothing {
        throw `UIElement.renderElement: Call of abstract method for control ${id}`
    }

    static render(context: UIElementRenderContext, id: string): TemplateResultOrNothing {
        if (context.dataContext.recordIndex === undefined || context.dataContext.recordIndex == -1) {
            return this.renderSkeleton(context, id)
        } else {
            return this.renderElement(context, id)
        }
    }

    static isVisible(context: UIElementRenderContext, id: string, value?: unknown) {
        const visible =
            context.elementDefinition.visible ??
            context.parentLayout?.defaultElementVisibility
        if (visible !== undefined) {
            if (visible === 'false' || visible == false) return false
            if (visible === 'true' || visible == true) return true
            if (visible === '.' && value !== undefined) {
                return Boolean(value)
            }
            if (typeof(visible) === "string") {
                const r = context.resolve(visible, id)
                console.log(`Layout ${id} resolves visible to`, r)
                return Boolean(r)
            }
        }
        return true
    }

    static isIdentifier(context: UIElementRenderContext) {
        if (context.uicomponent.linkIdentifiers) {
            if (context.elementDefinition.element_type.is_identifier) {
                return true
            }
        }
        return false
    }

    static maskIdentifier(context: UIElementRenderContext, definition: UISchemaIdentifierDisplay | undefined) {
        if (context.uicomponent.linkIdentifiers) {
            if (definition && definition !== true) {
                return definition.mask_identifier
            }
        }
        return undefined
    }

    static getStyleSetting(
        elementDefinition: UISchemaBaseUIElement,
        attribute: string,
        _default: string,
    ): string {
        if (elementDefinition.style) {
            if (elementDefinition.style.hasOwnProperty(attribute)) {
                return elementDefinition.style[attribute]
            }
        }
        return _default
    }

    public static getCSSClasses(context: UIElementRenderContext, css_classes: InterpretedExpression[] | undefined) : string[] {
        let toInterpret: string[] = []
        let result: string[] = []
        for (let css_class of (css_classes ?? [])) {
            if (context.uicomponent.interpretedExpressionPrefix.length > 0
                && (css_class as string).startsWith(context.uicomponent.interpretedExpressionPrefix)) {
                toInterpret.push(css_class)
            } else {
                result.push(css_class)
            }
        }
        if (toInterpret.length > 0) {
            result.push(...(context.resolve(toInterpret) as string[]))
        }
        return result
    }

    public static getCSSStyles(context: UIElementRenderContext, css_styles: Record<string, InterpretedExpression> | undefined) : Record<string,string> {
        let result: Record<string, string> = {}
        for (let [css_style, exp] of (Object.entries(css_styles ?? {}))) {
            if (context.uicomponent.interpretedExpressionPrefix.length > 0
                && (exp as string).startsWith(context.uicomponent.interpretedExpressionPrefix)) {
                let resolved = context.resolve(exp) as string | undefined
                if (resolved) {
                    result[css_style] = resolved
                }
            } else {
                result[css_style] = exp
            }
        }
        return result
    }

    static addStyle(currentStyles: string, newStyle: string) {
        if (!newStyle) return currentStyles

        return currentStyles ? currentStyles + ';' : '' + newStyle
    }

    // @ts-ignore
    static defaultAction(_: UISchemaUIElementType): string | undefined {
        return undefined
    }

    // protected static readLayoutSettings(elementDefinition: UISchemaTextField,
    //                                     max_max_expr: string,
    //                                     min_max_expr: string,
    //                                     default_unit: string, cssStyles: Record<string, string>) {
    //     function numberOrString(v: number |string, unit: string) {
    //         if (typeof(v) === "number") return `${v}${unit}`
    //         return v as string
    //     }
    //
    //     if (elementDefinition.layout?.max_height) {
    //         let v = `${elementDefinition.layout.max_height === 'max' ? max_max_expr : numberOrString(elementDefinition.layout.max_height, default_unit)}`
    //         if (v) cssStyles["max-height"] = v
    //     }
    //     if (elementDefinition.layout?.min_height) {
    //         let v = `${elementDefinition.layout.min_height === 'max' ? min_max_expr : numberOrString(elementDefinition.layout.min_height, default_unit)}`
    //         if (v) cssStyles["min-height"] = v
    //     }
    //
    //     if (elementDefinition.layout?.max_width) {
    //         let v = `${elementDefinition.layout.max_width === 'max' ? max_max_expr : numberOrString(elementDefinition.layout.max_width, default_unit)}`
    //         if (v) cssStyles["max-width"] = v
    //     }
    //
    //     if (elementDefinition.layout?.min_width) {
    //         let v = `${elementDefinition.layout.min_width === 'max' ? min_max_expr : numberOrString(elementDefinition.layout.min_width, default_unit)}`
    //         if (v) cssStyles["min-width"] = v
    //     }
    // }

    // protected static addPaddingStyle(padding: string | number | UISchemaLayoutPadding, cssStyles: Record<string,string>) {
    //     if (typeof padding === 'number') {
    //         cssStyles["padding"] = `${padding}px`
    //     } else if (typeof padding === 'string') {
    //         cssStyles["padding"] = padding
    //     } else if (padding) {
    //         cssStyles["padding"] = `${(<UISchemaLayoutPadding>padding).top} ${(<UISchemaLayoutPadding>padding).end} ${(<UISchemaLayoutPadding>padding).bottom} ${(<UISchemaLayoutPadding>padding).start}`
    //     }
    //     return cssStyles
    // }
    //
}
