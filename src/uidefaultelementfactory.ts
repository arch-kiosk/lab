import {UIConfigurableElementFactory} from "./uielementfactory";
import {UIElementTextField} from "./uielements/uielementtextfield";
import {UIElementDateField} from "./uielements/uielementdatefield";
import {UIElementDateTimeField} from "./uielements/uielementdatetimefield";
import {UIElementButton} from "./uielements/uielementbutton";
import {UIElementTemplateLabel} from "./uielements/uielementtemplatelabel";
import {UIElementComboBox} from "./uielements/uielementcombobox";
import {UIElementLine} from "./uielements/uielementline";
import {UIElementFile} from "./uielements/uielementfile";
import {UIElementBoolField} from "./uielements/uielementboolfield";

export class UIDefaultElementFactory extends UIConfigurableElementFactory {
    constructor() {
        super();
        this.addUIElementClass("textfield", UIElementTextField)
        this.addUIElementClass("datefield", UIElementDateField)
        this.addUIElementClass("datetimefield", UIElementDateTimeField)
        this.addUIElementClass("button", UIElementButton)
        this.addUIElementClass("templatelabel", UIElementTemplateLabel)
        this.addUIElementClass("selection", UIElementComboBox)
        this.addUIElementClass("line", UIElementLine)
        this.addUIElementClass("file", UIElementFile)
        this.addUIElementClass("bool", UIElementBoolField)
    }
}