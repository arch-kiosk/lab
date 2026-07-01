import {UISchemaUIElementLayoutSettings} from "../uischema";
import {UILayoutClass} from "./uilayoutclass";

export class UIStackLayoutClass extends UILayoutClass {
    cssClass = "ui-stack-layout"

    renderLayoutStyles(layout?: UISchemaUIElementLayoutSettings): string {
        const min_width = layout?.min_width
        let style = ""
        if (min_width) {
            if (min_width === "max") {
                style = 'width: 100%'
            } else {
                style = `width: ${min_width * 100}px`
            }
        }
        return style
    }
}
