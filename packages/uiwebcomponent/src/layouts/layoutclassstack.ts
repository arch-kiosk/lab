import { UISchemaUIElementElementLayout } from '../uischema'
import { UILayout } from './uilayout'

export class UIStackLayoutClass extends UILayout {
    cssClass = 'ui-stack-layout'

    renderLayoutStyles(layout?: UISchemaUIElementElementLayout): string {
        const min_width = layout?.min_width
        let style = ''
        if (min_width) {
            if (min_width === 'max') {
                style = 'width: 100%'
            } else {
                style = `width: ${min_width * 100}px`
            }
        }
        return style
    }
}
