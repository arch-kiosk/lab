import { ApiTimeZoneInfo, UISchemaUIElement } from '#src/uischema'
import { html, TemplateResult } from 'lit'
import { UIElementRenderContext } from '#src/uielementrendercontext'

export class UIElement {
    // eslint-disable-next-line typescript/no-explicit-any
    static resolve(context: UIElementRenderContext, expression?: string, id?: string): unknown {
        // return id ?? value
        return expression ? context.resolve(expression, id) : undefined

    }

    static batchResolve(context: UIElementRenderContext, expressions?: Array<string|undefined>, id?: string): Array<unknown> {
        // return id ?? value
        return expressions ? context.resolve(expressions, id) : undefined
    }

    static getTimeZoneInfo(
        context: UIElementRenderContext,
        tzIndex: number,
    ): ApiTimeZoneInfo | undefined {
        return context.getTimeZoneInfo(tzIndex)
    }

    static devInfo(context: UIElementRenderContext, ...texts: Array<string | undefined>) {
        if (context.uicomponent.showDevelopmentInfo) {
            const ht: Array<TemplateResult> = []
            for (const t of texts) {
                ht.push(
                    html`<span class="developer-info"">[${t == undefined ? 'undefined' : t}]</span>`,
                )
            }
            return ht
        } else return html``
    }

    static render(_context: UIElementRenderContext, id: string): TemplateResult {
        throw `UIElement.render: Call of abstract method for control ${id}`
    }

    static isVisible(context: UIElementRenderContext, value: unknown, id: string) {
        const visible =
            context.elementDefinition.visible ??
            context.parentLayout?.defaultElementVisibility
        if (visible !== undefined) {
            if (visible === 'false' || visible == false) return false
            if (visible === 'true' || visible == true) return true
            if (visible === '.') {
                return Boolean(value)
            }
            return Boolean(context.resolve(visible, id))
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

    static maskIdentifier(context: UIElementRenderContext) {
        if (context.uicomponent.linkIdentifiers) {
            if (context.elementDefinition.mask_identifier) {
                return context.elementDefinition.mask_identifier
            }
        }
        return undefined
    }

    static getStyleSetting(
        element: UISchemaUIElement,
        attribute: string,
        _default: string,
    ): string {
        if (element.style) {
            if (element.style.hasOwnProperty(attribute)) {
                return element.style[attribute]
            }
        }
        return _default
    }

    static getStyleTextAlign(element: UISchemaUIElementType) {
        const textAlign = this.getStyleSetting(element, 'text-align', '')
        switch (textAlign) {
            case 'left':
                return 'text-align: left'
            case 'right':
                return 'text-align: right'
            case 'center':
                return 'text-align: center'
        }
        return ''
    }

    static addStyle(currentStyles: string, newStyle: string) {
        if (!newStyle) return currentStyles

        return currentStyles ? currentStyles + ';' : '' + newStyle
    }

    // @ts-ignore
    static defaultAction(_: UISchemaUIElementType): string | undefined {
        return undefined
    }
}
