// oxlint-disable typescript/no-redundant-type-constituents
/**
 * UI Schema Definition V2
 * general rules:
 *   - All keywords or texts with semantic value use snake_case notation instead of PascalCase notation. That allows everything to be lowercase.
 *   - The cases are strictly enforced.
 */

/** The version of this schema definition */
 export interface UISchemaHeaderDictV2 {
    version: '2'
}

/* =========================================
        helper classes
   ========================================= */
export interface Dictionary<T> {
    [Key: string]: T
}

export type NumberOrString = number | string

/** And expression that needs to be interpreted first */
export type InterpretedExpression = string

/** JS throws an error of this class if the error is related to the schema definition */
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
 export interface UISchema {
    /** defines information about version and type of the definition language being used.
   These definitions control how to even parse the structure and what components and parts to expect.
   */
    header: UISchemaHeaderDictV2

    /** additional information used by diverse parties processing the schema.
     * Not rendered within the ui but informing the context within which the schema is being interpreted or even rendered. */
    meta?: UISchemaMetaSettings

    /** data set definition for database-bound elements within the definition.
     * This is not being directly used by the ui component but it serves as contextual data that might be used by the host of the layout */
    dsd?: UISchemaDSDDict

    /** describes the data source and how the ui is interacting with it */
    data_binding: UISchemaDataBindingSettings

    /** the root element has to be a layout element */
    root: UISchemaUIRootLayoutElement
}

 export interface UISchemaMetaSettings {
    scenario?: string
}

 export interface UISchemaDSDDict {
    [key: string]: string[]
}

/** describes the data source and how the ui is interacting with it */
export type UISchemaDataBindingCardinalities = '1' | 'N'

/** describes the data source and how the ui is interacting with it */
 export interface UISchemaDataBindingSettings {
    /** "1" means the data source provides only one row, N that there are multiple rows */
    cardinality: UISchemaDataBindingCardinalities
}


//  export interface UISchemaLayoutSettings {
// }

//  export interface UISchemaListLayoutSettings extends UISchemaLayoutSettings {
//   type: "list"
//   order_records_by: undefined | Array<string>
//   allow_ordering_by: undefined | Array<string>
// }

 export interface UISchemaBaseUIElement {
    /** positioning, spatial dimensions and positioning - how the element interacts on the layout */
    layout?: UISchemaUIElementElementLayout
    /** how the element itself appears */
    style?: UISchemaUIElementStyleBasics
    enabled?: InterpretedExpression | boolean
    visible?: InterpretedExpression | boolean
}

 export interface UISchemaDynamicUIElement extends UISchemaBaseUIElement {
    text?: InterpretedExpression
    value?: InterpretedExpression
}

 export interface UISchemaBoundUIElement extends UISchemaDynamicUIElement {
    readonly?: boolean
    binding?: UISchemaUIElementBinding
}

 export interface UISchemaUIElementStyleBasics {
    css_classes?: InterpretedExpression[]
    css_styles?: InterpretedExpression[]
}

 export interface UISchemaIdentifierDisplay {
    is_identifier?: boolean
    mask_identifier?: boolean
}

 export interface UISchemaUIRootLayoutElement extends UISchemaLayoutElement {

}

 export interface UISchemaUIElementBinding {
    field_name: string
}

export type UISchemaUIElementLayoutDimension = number | 'max' | string

 export interface UISchemaUIElementElementLayout {
    min_width?: UISchemaUIElementLayoutDimension
    min_height?: UISchemaUIElementLayoutDimension
    max_height?: UISchemaUIElementLayoutDimension
    max_width?: UISchemaUIElementLayoutDimension
    padding?: NumberOrString | UISchemaLayoutPadding
}

 export interface UISchemaLayoutPadding {
    top?: NumberOrString
    end?: NumberOrString
    bottom?: NumberOrString
    start?: NumberOrString
}

/**
 * @oneOf
 */
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

 export interface UISchemaLayoutSettings {
    /** settings for how the layout renders its elements */
    orchestration_strategy: string
    readonly?: boolean
    order?: string[]
    default_element_visibility?: InterpretedExpression | boolean
}

 export interface UISchemaLayoutElement extends UISchemaBaseUIElement,  UISchemaLayoutSettings {
    element_type: 'layout'
    /** elements grouped in this layout */
    ui_elements: Dictionary<UISchemaUIElements>
}

 export interface UISchemaButton extends UISchemaDynamicUIElement {
    element_type: 'button'
    button_type?: 'okButton' | 'cancelButton' | 'iconButton'
    icon?: InterpretedExpression
    default?: 'ENTER' | 'CANCEL'
}

 export interface UISchemaTextField extends UISchemaBoundUIElement, UISchemaIdentifierDisplay {
    element_type: 'text_field'
    /** settings to limit the text length */
    ellipsis?: UISchemaDisplayEllipsis
    multiline?: boolean
}
/** settings to limit the text length and format the way the ellipsis is displayed */
 export interface UISchemaDisplayEllipsis {
    max_characters: number
}

 export interface UISchemaDateTimeField extends UISchemaBoundUIElement {
    element_type: 'date_time_field'
    date_format?: string
    include_time?: boolean
}

 export interface UISchemaLine extends UISchemaBaseUIElement {
    element_type: 'line'
    transparent?: boolean
}

 export interface UISchemaComboBox extends UISchemaBoundUIElement {
    element_type: 'selection'
    items: Array<string> | UISchemaLookupSettings
}

 export interface UISchemaTemplateLabel extends UISchemaDynamicUIElement, UISchemaIdentifierDisplay  {
    element_type: 'template_label'
}

 export interface UISchemaBoolField extends UISchemaBoundUIElement {
    element_type: 'bool'
}

 export interface UISchemaLookupSettings {
    topic: string
    selection: string[]
    key: string
}

 export interface UISchemaFile extends UISchemaDynamicUIElement {
    element_type: 'file'
    resolution: string
    alternate_description?: string
    file_description?: 'right' | 'bottom' | 'none'
    align_image?: 'center' | 'left'
    fit_content?: 'contain' | 'fit' | 'scale'
}
