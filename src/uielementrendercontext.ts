import {UIComponent} from "./ui-component";
import {ApiTimeZoneInfo, UIInputData, UILayout, UISchemaUIElement} from "./uischema";
import {UILayoutClass} from "./layoutclasses";
import {replaceData} from "./tools";

export class RenderContext {
    uicomponent: UIComponent
    layouter: UILayoutClass
    data: UIInputData
    _lastUID: string = ""

    constructor(component: UIComponent,
                layouter: UILayoutClass, data: UIInputData) {
        this.uicomponent = component
        this.layouter = layouter
        this.data = data
        this._lastUID = ""
    }

    public haulData(value?: string, id?: string):any {
        if (value === undefined)
            return ""
        value = replaceData(value, this.data)
        if (!!this.uicomponent.dataProvider && value != undefined) {
            value = this.uicomponent.dataProvider(value, id)
            // console.log(`Dataprovider returned ${value}`)
        }
        return value
    }

    public getTimeZoneInfo(tzIndex: number|undefined) : ApiTimeZoneInfo | undefined {
        let rc = undefined
        if (!!this.uicomponent.timeZoneInfoProvider && tzIndex != undefined) {
            rc = this.uicomponent.timeZoneInfoProvider(tzIndex)
        }
        return rc
    }

    public resetCursor() {
        this._lastUID = ""
    }

    public getCurrentUID() {
        try {
            if (!!this.uicomponent.dataProvider) {
                let value = this.uicomponent.dataProvider("#(uid)", undefined)
                if (value && value === "#(uid)") {
                    return undefined
                } else {
                    return value
                }
            }
        } catch(e) {
            console.error(`uielementrendercontext.getCurrentUID:`,e)
        }
        return undefined
    }

    public next() : boolean {
        if (this.uicomponent && this.uicomponent.moveToNextRow) {
            this._lastUID = this.uicomponent.moveToNextRow(this._lastUID)
            return this._lastUID !== ""
        } else
            return false
    }
}

export class UIElementRenderContext extends RenderContext{
    entry: UISchemaUIElement

    constructor(component: UIComponent, entry: UISchemaUIElement,
                layouter: UILayoutClass, data: UIInputData) {
        super(component, layouter, data)
        this.entry = entry
    }
}

export class UILayoutRenderContext extends RenderContext{
    entry: UILayout
    _sortOrder: Array<string> = []

    constructor(component: UIComponent, entry: UILayout,
                layouter: UILayoutClass, data: UIInputData) {
        super(component, layouter, data)
        this.entry = entry
    }

    resetCursor() {
        super.resetCursor();
    }

}