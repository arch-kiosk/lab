import {UISchemaUIElementLayoutSettings} from "../uischema";
import {UILayoutClass} from "./uilayoutclass";

export class UIColumnLayoutClass extends UILayoutClass {
    cssClass = "ui-column-layout"

    renderLayoutStyles(layout?: UISchemaUIElementLayoutSettings): string {
        const min_width = layout?.min_width
        let style = ""
        if (min_width) {
            if (min_width === "max") {
                style = 'grid-column: 1 / -1;'
            } else {
                style = `grid-column-end: span ${min_width}`
            }
        }
        return style
    }
}
