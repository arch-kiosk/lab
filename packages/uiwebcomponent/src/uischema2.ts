// oxlint-disable typescript/no-redundant-type-constituents
/**
 * UI Schema Definition V2
 * general rules:
 *   - All keywords or texts with semantic value use snake_case notation instead of PascalCase notation. That allows everything to be lowercase.
 *   - The cases are strictly enforced.
 */

/** The version of this schema definition */
export declare interface UISchemaHeaderDictV2 {
    version: '2'
}

export class UISchemaError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'UISchemaError'
    }
}

/**
 * UISchema defines the top level structure of the schema definition. This is the starting point. The structure itself contains mostly contextual information
 * for the use cases in which a schema appears.
 *
 */
export declare interface UISchema {
    /** defines information about version and type of the definition language being used.
   These definitions control how to even parse the structure and what components and parts to expect.
   */
    header: UISchemaHeaderDictV2

    /** additional information used by diverse parties processing the schema.
     * Not rendered within the ui but defining the context within which the schema is being interpreted or even rendered. */
    meta?: UISchemaMetaSettings

    /** data set definition for database-bound elements within the definition.
     * This is not being directly used by the ui component but it serves as contextual data that might be used by the host of the layout */
    dsd?: UISchemaDSDDict

    /** describes the data source and how the ui is interacting with it */
    data_binding: UISchemaDataBindingSettings

    root: UISchemaUIRootLayoutElement
}

/** describes the data source and how the ui is interacting with it */
export declare interface UISchemaDataBindingSettings {
    /** "1" means the data source provides only one row, N that there are multiple rows */
    cardinality: '1' | 'N'
}

export interface Dictionary<T> {
    [Key: string]: T
}

export declare interface ApiTimeZoneInfo {
    tz_index: number
    tz_long: string
    tz_IANA: string
    deprecated: boolean
}

export declare interface UISchemaMetaSettings {
    scenario?: string
}

export declare interface UISchemaDSDDict {
    [key: string]: string[]
}

// export declare interface UISchemaLayoutSettings {
// }

// export declare interface UISchemaListLayoutSettings extends UISchemaLayoutSettings {
//   type: "list"
//   order_records_by: undefined | Array<string>
//   allow_ordering_by: undefined | Array<string>
// }

export declare interface UISchemaUIElement {
    layout?: UISchemaUIElementElementLayout
    enabled?: boolean
    visible?: string | false | true
    style?: { [key: string]: string }
    extra_style?: string
    is_identifier?: boolean
    mask_identifier?: string
    text?: string
    max_characters?: number
    value?: string
    default?: 'ENTER' | 'CANCEL'
}

export declare interface UISchemaBoundUIElement extends UISchemaUIElement {
    readonly?: boolean
    binding?: UISchemaUIElementBinding
}

export declare interface UISchemaUIRootLayoutElement extends UISchemaLayoutElement {}

export declare interface UISchemaUIElementWithId {
    id: string
    element: UISchemaUIElement
}

export declare interface UISchemaUIElementBinding {
    field_name: string
}

export declare interface UISchemaUIElementElementLayout {
    min_width?: number | 'max' | string
    min_height?: number | 'max' | string
    max_height?: number | 'max' | string
    max_width?: number | 'max' | string
    padding?: number | string | UISchemaLayoutPadding
}

export declare interface UISchemaLayoutPadding {
    top: number
    right: number
    bottom: number
    left: number
}

export type UISchemaUIElements =
    | UISchemaLayoutElement
    | UISchemaButton
    | UISchemaTextField
    | UISchemaDateTimeField
    | UISchemaLine
    | UISchemaComboBox
    | UISchemaTemplateLabel
    | UISchemaBoolField
    | UISchemaFile
export declare interface UISchemaLayoutSettings {
    /** settings for how the layout renders its elements */
    // layout_settings: UISchemaLayoutSettings
    orchestration_strategy: string
    readonly?: boolean
    order?: string[]
    default_element_visibility?: string | boolean
}
export declare interface UISchemaLayoutElement
    extends Omit<UISchemaUIElement, 'binding'>, UISchemaLayoutSettings {
    element_type: 'layout'

    /** elements grouped in this layout */
    ui_elements: Dictionary<UISchemaUIElements>
}

export declare interface UISchemaButton extends UISchemaUIElement {
    element_type: 'button'
    button_type?: 'okButton' | 'cancelButton' | 'iconButton'
    icon?: string
}

export declare interface UISchemaTextField extends UISchemaBoundUIElement {
    element_type: 'text_field'
    multiline?: boolean
}

export declare interface UISchemaDateTimeField extends UISchemaBoundUIElement {
    element_type: 'date_time_field'
    date_format?: string
    include_time?: boolean
}

export declare interface UISchemaLine extends UISchemaUIElement {
    element_type: 'line'
    transparent?: boolean
}

export declare interface UISchemaComboBox extends UISchemaBoundUIElement {
    element_type: 'selection'
    items: Array<string> | UISchemaLookupSettings
}

export declare interface UISchemaTemplateLabel extends UISchemaUIElement {
    element_type: 'template_label'
}

export declare interface UISchemaBoolField extends UISchemaBoundUIElement {
    element_type: 'bool'
}

export declare interface UISchemaLookupSettings {
    topic: string
    selection: [string]
    key: string
}

export declare interface UISchemaFile extends UISchemaUIElement {
    element_type: 'file'
    resolution: string
    alternate_description?: string
    file_description?: 'right' | 'bottom' | 'none'
    align_image?: 'center' | 'left'
    fit_content?: 'contain' | 'fit' | 'scale'
}
