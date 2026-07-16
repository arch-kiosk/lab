import {UIComponentBasePlugin} from "#src/uicomponentbaseplugin";
import {UIConfigurableElementFactory} from "#src/uielementfactory";
import { UIElementTextField } from "./uielements/uielementtextfield"
import { UIElementDateField } from "./uielements/uielementdatefield"
import { UIElementDateTimeField } from "./uielements/uielementdatetimefield"
import { UIElementButton } from "./uielements/uielementbutton"
import { UIElementTemplateLabel } from "./uielements/uielementtemplatelabel"
import { UIElementComboBox } from "./uielements/uielementcombobox"
import { UIElementLine } from "./uielements/uielementline"
import { UIElementFile } from "./uielements/uielementfile"
import { UIElementBoolField } from "./uielements/uielementboolfield"

export class DefaultUIElementFactory extends UIComponentBasePlugin {
    constructor(active=true) {
        super();
        this.active = active
    }
    boot = (): Promise<void> => {
        console.log(`booting plugin ${this.name}`)
        if (this.pluginManager) {
            console.info("plugin DefaultUIElementFactory is listening to registerUIElements event ...")
            this.pluginManager.listen(this, "registerUIElements", this.registerUIElements)
        }
        return Promise.resolve();
    }

    registerUIElements = (factory: UIConfigurableElementFactory) => {
        factory.addUIElementClass("textfield", UIElementTextField)
        factory.addUIElementClass("datefield", UIElementDateField)
        factory.addUIElementClass("datetimefield", UIElementDateTimeField)
        factory.addUIElementClass("button", UIElementButton)
        factory.addUIElementClass("templatelabel", UIElementTemplateLabel)
        factory.addUIElementClass("selection", UIElementComboBox)
        factory.addUIElementClass("line", UIElementLine)
        factory.addUIElementClass("file", UIElementFile)
        factory.addUIElementClass("bool", UIElementBoolField)
    }

}