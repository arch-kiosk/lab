import { UIComponent } from './uicomponent'
import { ApiTimeZoneInfo, UISchemaLayoutElement, UISchemaUIElements } from './uischema'
import { UILayout } from './layoutclasses'
import { DataProviderValidationResult } from '@arch-kiosk/virtualizerlab'
// import { replaceData } from './tools'

/**
 * the DataContext of the RenderContext: ties the current rendering step to a record of the dataprovider
 */
export interface RenderContextDataContext {
    /** recordIndex is either -1 (not tied to any record)
     *  or a positive number under which the dataProvider would find a record */
    recordIndex: number
    /** recordUID is the optional unique id of the record. Usually that is a UUID, but it is really up to the dataprovider. * */
    recordUID?: string
    /** recordUID is the optional unique id of the record. Usually that is a UUID, but it is really up to the dataprovider. * */
    record?: unknown
}

/**
 * every layout or element receives this information about the current context in which it renders.
 */
export class RenderContext {
    uicomponent: UIComponent
    parentLayout?: UILayout
    dataContext: RenderContextDataContext

    constructor(component: UIComponent, dataContext: RenderContextDataContext, parentLayout?: UILayout) {
        this.uicomponent = component
        this.parentLayout = parentLayout
        this.dataContext = dataContext
    }

    /**
     * getScopedId creates a unique identifier on the basis of an id (usually the id of a uielement or a layout in the ui schema) and the current
     * record. That way ui-elements that get replicated because they are used in multiple rows or some such can still create a stable id that is unique and
     * predictable.
     * @param id the fix id, e.g. as defined in the ui schema
     * @returns the id in the form id + suffix with suffix being '_R' + recordIndex. Note that no suffix is appended if the recordIndex is -1
     */
    public getScopedId(id: string) {
        return this.uicomponent.scopeId(id, this.dataContext.recordIndex)
    }

    public resolve(expression?: string | Array<string|undefined>, id?: string): unknown {
        if (expression === undefined) return ''
        const expressions = typeof(expression) === "string" ? [expression] : expression

        // value = replaceData(value, this.data)
        if (this.uicomponent.dataProvider && expression != undefined) {
            return this.uicomponent.dataProvider.resolve(expressions, id, this.dataContext?.recordIndex)
        }
        return expression
    }

    public getFieldValidationInfo(fieldId:string): Array<DataProviderValidationResult> | undefined {
        return this.uicomponent.dataProvider?.getFieldValidationInformation(this.dataContext?.recordIndex, fieldId)
    }

    public getTimeZoneInfo(tzIndex: number | undefined): ApiTimeZoneInfo | undefined {
        let rc = undefined
        if (!!this.uicomponent.timeZoneInfoProvider && tzIndex != undefined) {
            rc = this.uicomponent.timeZoneInfoProvider(tzIndex)
        }
        return rc
    }

    public resetCursor() {
        throw new Error('RenderContext.resetCursor not implemented')
    }

    public getCurrentUID() {
        throw new Error('RenderContext.getCurrentUID not implemented')
        try {
            // if (!!this.uicomponent.dataProvider) Gemini purports the !! is really redundant. I don't know how or why it got there
            if (this.uicomponent.dataProvider) {
                let value = this.uicomponent.dataProvider('#(uid)', undefined)
                if (value && value === '#(uid)') {
                    return undefined
                } else {
                    return value
                }
            }
        } catch (e) {
            console.error(`uielementrendercontext.getCurrentUID:`, e)
        }
        return undefined
    }

    public next(): boolean {
        throw new Error('RenderContext.next not implemented')
        if (this.uicomponent && this.uicomponent.moveToNextRow) {
            this._lastUID = this.uicomponent.moveToNextRow(this._lastUID)
            return this._lastUID !== ''
        } else return false
    }
}

export class UIElementRenderContext extends RenderContext {
    elementDefinition: UISchemaUIElements

    constructor(component: UIComponent, elementDefinition: UISchemaUIElements, dataContext: RenderContextDataContext, parentLayout: UILayout) {
        super(component, dataContext, parentLayout)
        this.elementDefinition = elementDefinition
    }
}

export class UILayoutRenderContext extends RenderContext {
    layoutDefinition: UISchemaLayoutElement

    constructor(component: UIComponent, layoutDefinition: UISchemaLayoutElement, dataContext: RenderContextDataContext, parentLayout?: UILayout) {
        super(component, dataContext, parentLayout)
        this.layoutDefinition = layoutDefinition
    }

    resetCursor() {
        super.resetCursor()
    }
}
