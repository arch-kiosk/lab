// import {DataNotifier, DataRecord, RecordState} from "@arch-kiosk/virtualscrollcontainer/src/sharedtypes";
import { ApiTimeZoneInfo, Dictionary, UISchemaLookupSettings, UISchemaUIElements } from './uischema'
import { VirtualScrollContainerDataProvider } from '@arch-kiosk/virtualizerlab'
import { ComboBoxDataProviderParams } from '@vaadin/combo-box'
import { ComboBoxDataProviderCallback } from '@vaadin/combo-box/src/vaadin-combo-box-data-provider-mixin'
import { UILayout } from '#src/layouts/uilayout'
import { TemplateResult } from 'lit'
import { RenderContextDataContext } from '#src/uielementrendercontext'
import { DataProviderValidationResult } from '@arch-kiosk/virtualizerlab'

export interface UIComponentDataProvider extends VirtualScrollContainerDataProvider {
    resolve(expression?: string | Array<string|undefined>, id?: string, recordIndex?: number): unknown
    getFieldValidationInformation(recordIndex: number, fieldId:string): Array<DataProviderValidationResult>
    getRecordValidationInformation(recordIndex: number): Array<DataProviderValidationResult>
    // setNotifier(notifier: DataNotifier): void
    // getTelemetry?(): { cached: number; capacity: number }
    // logTelemetry?(): void
    // addRecord(record: DataRecord): void
    // deleteRecords(uids: string[]) : Promise<void>
}

// eslint-disable-next-line typescript/no-explicit-any
export type UISchemaLookupProvider = (
    elementId: string,
    lookupSettings: UISchemaLookupSettings,
    params: ComboBoxDataProviderParams,
    callback: ComboBoxDataProviderCallback<unknown>,
) => void

export {type Dictionary} from './uischema'

// eslint-disable-next-line typescript/no-explicit-any
// export type UIComponentDataProvider = (exp: string, id?: string) => any

export type UIComponentTimeZoneInfoProvider = (tzIndex: number) => ApiTimeZoneInfo

export type UIComponentMoveToNextRowProvider = (lastUID: string) => string

export type UIComponentSetSortOrderProvider = (sortOrder: Array<string>) => void

export type UIComponentFileFetchParams = {
    uuid: string
    resolution: string
    reportURL: (url: string) => void
}

export type UIComponentFetchFileProvider = (params: UIComponentFileFetchParams) => Promise<string>

// eslint-disable-next-line typescript/no-explicit-any
export type UIInputData = Dictionary<any>

export type UIElementRenderer = (
    id: string,
    elementDefinition: UISchemaUIElements,
    parentLayout: UILayout,
    dataContext: RenderContextDataContext
) => TemplateResult
// export declare interface UISchemaUIElements {
//     [key: string]: UISchemaUIElement
// }
