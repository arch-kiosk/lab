import {
    UISchemaElementOnLayout,
    UISchemaOrchestrationStrategyKeys
} from '../uischema'
import { UILayout } from './uilayout'

export class UIColumnLayoutClass extends UILayout {
    cssClass = 'ui-column-layout'
    public cardinality: "1" | "N" = "1"

    renderLayoutStyles(elementDefinition: UISchemaElementOnLayout<UISchemaOrchestrationStrategyKeys>, _elementRenderContext?: unknown): string {
        const minWidth = elementDefinition.layout?.min_width
        let cssStyle: Record<string,string>= {}
        if (minWidth) {
            if (minWidth === 'max') {
                cssStyle['grid-column'] = '1 / -1'
            } else {
                cssStyle['grid-column-end'] = `span ${minWidth}`
            }
        }
        return Object.values(cssStyle).length > 0 ? Object.entries(cssStyle).map(([key, val]) => `${key}:${val}`).join(";") : ""
    }
}
