// export type AnyDict = {
//     [key: string]: any
// }

import {ComboBoxDataProviderParams} from "@vaadin/combo-box";
import {ComboBoxDataProviderCallback} from "@vaadin/combo-box/src/vaadin-combo-box-data-provider-mixin";
// import * as string_decoder from "string_decoder";

export interface Dictionary<T> {
    [Key: string]: T;
}

export declare interface ApiTimeZoneInfo {
    tz_index: number,
    tz_long: string,
    tz_IANA: string,
    deprecated: boolean
}

export declare interface UILayout {
    layout_settings?: UISchemaLayoutSettings
    ui_elements: Dictionary<UISchemaUIElement>
}
export declare interface UISchema extends UILayout{
    header: UISchemaHeaderDict
    meta?: UISchemaMetaSettings
    dsd?: UISchemaDSDDict
}

export declare interface UISchemaHeaderDict {
    version: number
}

export declare interface UISchemaMetaSettings {
    scenario?: string
}

export declare interface UISchemaDSDDict {
    [key:string]: string[]
}

export declare interface UISchemaLayoutSettings{
    type?: "sheet" | "list"
    orchestration_strategy?: string
    readonly?: boolean
    order?: string[]
    default_element_visibility?: string | boolean
}

export declare interface UISchemaListLayoutSettings extends UISchemaLayoutSettings {
    type: "list"
    order_records_by: undefined | Array<string>
    allow_ordering_by: undefined | Array<string>
}

export declare interface UISchemaUIElement {
    binding?: UISchemaUIElementBinding
    layout?: UISchemaUIElementLayoutSettings
    element_type: UISchemaUIElementType
}

export declare interface UISchemaUIElementWithId {
    id: string
    element: UISchemaUIElement
}

export declare interface UISchemaUIElementBinding {
    field_name: string
}

export declare interface UISchemaUIElementLayoutSettings {
    min_width?: number | "max"
    max_height?: number | "max"
    max_width?: number | "max"
    padding?: number | string | UISchemaLayoutPadding
    readonly?: boolean
}

export declare interface UISchemaLayoutPadding {
    top: number,
    right: number,
    bottom: number,
    left: number
}

export declare interface UISchemaUIElementType {
    name: string
    enabled?: boolean
    is_identifier?: boolean
    mask_identifier?: string
    text?: string
    max_characters?: number,
    value?: string
    visible?: string
    style?: {[key:string]: string}
    extra_style?: string
    padding?: number | string | UISchemaLayoutPadding
    readonly?: boolean
    default?: "ENTER" | "CANCEL"
}

export declare interface UISchemaLayoutElement extends UISchemaUIElementType, UILayout {
    name: "layout"
    layout?: UISchemaUIElementLayoutSettings
}

export declare interface UISchemaButton extends UISchemaUIElementType {
    name: "button"
    type?: "okButton" | "cancelButton" | "iconButton"
    icon?: string
}

export declare interface UISchemaTexTField extends UISchemaUIElementType {
    multiline: boolean
}
export declare interface UISchemaDateTimeField extends UISchemaUIElementType {
    date_format?: string
    include_time?: boolean
}

export declare interface UISchemaLine extends UISchemaUIElementType {
    transparent?: boolean
}

export declare interface UISchemaComboBox extends UISchemaUIElementType {
    name: "selection"
    items: Array<string> | UISchemaLookupSettings
}

export declare interface UISchemaTemplateLabel extends UISchemaUIElementType {
    name: "templatelabel"
    // style?: string
}

export declare interface UISchemaBoolField extends UISchemaUIElementType {
    name: "bool"
}

export declare interface UISchemaLookupSettings {
    topic: string
    selection: [string]
    key: string
}

export declare interface UISchemaFile extends UISchemaUIElementType {
    resolution: string
    file_description?: "right" | "bottom" | "none"
    align_image?: "center" | "left"
    fit_content?: "contain" | "fit" | "scale"
}


export type UISchemaLookupProvider = (elementId: string, lookupSettings: UISchemaLookupSettings, params: ComboBoxDataProviderParams, callback: ComboBoxDataProviderCallback<any>) => void;

export type UIComponentDataProvider = (exp: string, id?: string) => any;

export type UIComponentTimeZoneInfoProvider = (tzIndex: number) => ApiTimeZoneInfo;

export type UIComponentMoveToNextRowProvider = (lastUID: string) => string;

export type UIComponentSetSortOrderProvider = (sortOrder: Array<string>) => void;

export type UIComponentFileFetchParams = {
    uuid: string
    resolution: string
    reportURL: (url: string) => void
}

export type UIComponentFetchFileProvider = (params: UIComponentFileFetchParams) => Promise<string>;

export type UIInputData = Dictionary<any>

// export declare interface UISchemaUIElements {
//     [key: string]: UISchemaUIElement
// }
