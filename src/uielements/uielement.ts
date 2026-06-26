import {ApiTimeZoneInfo, UISchemaUIElementType} from "../uischema";
import {html, TemplateResult} from "lit";
import {UIElementRenderContext} from "../uielementrendercontext";

export class UIElement {
    static haulData(context: UIElementRenderContext, value?: string, id?: string):any {
        return context.haulData(value, id)
    }

    static getTimeZoneInfo(context: UIElementRenderContext, tzIndex: number):ApiTimeZoneInfo | undefined {
        return context.getTimeZoneInfo(tzIndex)
    }

    static devInfo(context: UIElementRenderContext, ...texts: Array<string|undefined>) {
        if (context.uicomponent.showDevelopmentInfo) {
            const ht: Array<TemplateResult> = []
            for (const t of texts) {
                ht.push(html`<span class="developer-info"">[${t==undefined?"undefined":t}]</span>`)
            }
            return ht
        } else
            return html``
    }

    static render(_context: UIElementRenderContext, id: string):TemplateResult {
        throw `UIElement.render: Call of abstract method for control ${id}`
    }

    static isVisible(context: UIElementRenderContext, value: any) {
        let visible = <any> context.entry.element_type.visible
        if (visible === undefined) visible = context.layouter.defaultElementVisibility
        if (visible === "false" || visible == false) return false
        if (visible === "true" || visible == true) return true
        if (visible === ".") {
            return !!value
        }
        return Boolean(this.haulData(context, visible))
    }

    static isIdentifier(context: UIElementRenderContext) {
        if (context.uicomponent.linkIdentifiers) {
            if (context.entry.element_type.is_identifier) {
                return true
            }
        }
        return false
    }

    static getStyleSetting(element: UISchemaUIElementType, attribute: string, _default: string): string {
        if (element.style) {
            if (element.style.hasOwnProperty(attribute)) {
                return element.style[attribute]
            }
        }
        return _default
    }

    static getStyleTextAlign(element: UISchemaUIElementType) {
        const textAlign = this.getStyleSetting(element, "text-align", "")
        switch (textAlign) {
            case "left": return "text-align: left"
            case "right": return "text-align: right"
            case "center": return "text-align: center"
        }
        return ""
    }

    static addStyle(currentStyles: string, newStyle: string) {
        if (!newStyle)
            return currentStyles

        return currentStyles?currentStyles + ";":"" + newStyle
    }

    // @ts-ignore
    static defaultAction(element: UISchemaUIElementType): string|undefined {
        return undefined;
    }
}