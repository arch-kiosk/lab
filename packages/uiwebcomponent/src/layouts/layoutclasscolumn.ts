import { UISchemaUIElementElementLayout } from '../uischema'
import { UILayout } from './uilayout'

export class UIColumnLayoutClass extends UILayout {
    cssClass = 'ui-column-layout'
    public cardinality: "1" | "N" = "1"

    renderLayoutStyles(layout?: UISchemaUIElementElementLayout): string {
        const min_width = layout?.min_width
        let style = ''
        if (min_width) {
            if (min_width === 'max') {
                style = 'grid-column: 1 / -1;'
            } else {
                style = `grid-column-end: span ${min_width}`
            }
        }
        return style
    }
}
