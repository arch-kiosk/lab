// oxlint-disable typescript/no-redundant-type-constituents
/**
 * UI Schema Definition V2
 * axoims:
 *   - All keywords or texts that are used within the schema language use snake_case notation instead of PascalCase notation.
 *      That allows everything to be lowercase. The TypeScript type names use the normal PascalCase notation
 *   - The cases are strictly enforced.
 *   - This is designed towards type checking code and creating a json-schema for the ui schema. This is not optimized towards documentation (typedoc).
 *   - All documentation of the ui-schema language happens in this file in typedoc notation

 */

/** @hidden */
declare const __brand: unique symbol


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

/** And expression that needs to be interpreted first. How it gets interpreted and what syntax it would have to follow is entirely up to the
 * components host. This will simply be piped through to the data provider's resolve() method as is */
export type InterpretedExpression = string & {
    /** @hidden */
    readonly [__brand]?: 'InterpretedExpression'
};

/** A dynamic css expression (like "calc(10px + 5vh) that will be interpreted at runtime. */
export type UISchemaDynamicCSSExpression = string

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

    /** Optional information used by a variety of processes using the schema.
     * Not rendered within the ui but informing the context within which the schema is being interpreted or even rendered. */
    meta?: UISchemaMetaSettings

    /** Optional data set definition for database-bound elements within the definition.
     * This is not being directly used by the ui component but it serves as contextual data that might be used by the host of the layout */
    dsd?: UISchemaDSDDict

    /** mandatory. describes the data source and how the ui is interacting with it */
    data_binding: UISchemaDataBindingSettings

    /** the root element has to be a layout element */
    root: UISchemaUIRootLayoutElement
}

/** Meta information used by a variety of processes reading the schema.
 * Not rendered within the ui but informing the context within which the schema is being interpreted. */
export interface UISchemaMetaSettings {
    scenario?: string
}

/** Data set definition for database-bound elements within the definition.
 * This is not being directly used by the ui component but it serves as contextual data that might be used by the host of the layout */
export interface UISchemaDSDDict {
    [key: string]: string[]
}

/** Cardinality of the main record source */
/** "1" means the data source provides only one row, N that there are multiple rows */
export type UISchemaDataBindingCardinalities = '1' | 'N'

/** describes the data source and how the ui is interacting with it */
export interface UISchemaDataBindingSettings {
    cardinality: UISchemaDataBindingCardinalities
}

/**
 * The base interface from which each element on the UI derives its basic settings.
 */
export interface UISchemaBaseUIElement {
    // /** optional spatial dimensions and positioning - how the element interacts within the layout */
    // layout?: UISchemaOrchestrationStrategyElementLayouts[S]

    /** optional visual design - how the element itself appears */
    style?: UISchemaUIElementStyleBasics

    /** optional. Determines if the element is visible. Defaults to a layout setting or true.
     * @see {@link InterpretedExpression}*/
    visible?: InterpretedExpression | boolean
}

/**
 * The base interface for all ui elements that show a dynamic value.
 * This is different from totally static elements like a line or something like that.
 */
export interface UISchemaDynamicUIElement extends UISchemaBaseUIElement {

    /** optional. the text for the label or name of the field on the ui
     * Some elements do not interpret this property because they don't show
     * a label. Refer to the element's documentation */

    text?: InterpretedExpression

    /** optional. the expression that defines what value is being displayed in the input part of the element
    * Some elements do not interpret this property or do not show it as a direct value
    * Refer to the element's documentation */
    value?: InterpretedExpression
}

/**
 * The base interface for all ui elements that can receive an input from the user and is thus bound to the data.
 */
export interface UISchemaBoundUIElement extends UISchemaDynamicUIElement {
    /** optional. Determines if a field can be navigated to (receive the focus). Default is true. */
    enabled?: InterpretedExpression | boolean

    /** optional. Determines if a field takes inputs right now.
     * The element might still receive the caret or focus (unlike enabled=false elements), you just cannot change the value.
     * but you might e.g. be able to copy the input value onto the clipboard.
     * Default is false. */
    readonly?: boolean

    /** binding to the data*/
    binding: UISchemaUIElementBinding
}

/**
 * settings that bind a BoundUIElement to the data provider
 */
export interface UISchemaUIElementBinding {
    field_name: string
}

/** visual design - how the element itself appears.
 * Elements implement more specific descendants of this interface */
export interface UISchemaUIElementStyleBasics {

    /** optional list of css classes. You can either state static css class names or use expressions that get interpreted and can return a class name.
     *
     * ⚠️ Use this sparingly. Don't set classes that would clash with other indirect style settings or for which a more guided setting exists.
     * E.g. Don't assign a class that sets max-height or any of the properties that you find in {@link UISchemaUIElementElementLayoutBase}.
     *
     * Note that an expression is only sent to the host for interpretation if it starts with a prefix that the host set
     * on the ui-component (property `interpretedExpressionPrefix`).
     * By default, that prefix is unset, so nothing gets sent to the host for interpretation.
     *
     * @example
     * In this example the host would have set the `interpretedExpressionPrefix` to `#` to receive the css style `border` for interpretation.
     *
     * ```json
     *                    style: {
     *                         css_classes: ['my-class', '#getSomeClass()'],
     *                     },
     * ```
     */
    css_classes?: Array<string | InterpretedExpression>

    /** optional dictionary of direct css style settings. You can either state direct css expressions (like "text-align: center")
     * or interpreted expressions that get interpreted by the host and return such a css style expression.
     *
     * You can use all valid css expressions, including things like `calc(1vh - 5px)` or variables like `--my-css-variable`
     *
     * ⚠️ Don't set styles directly that would interfere with other indirect style settings or for which a more guided setting exists.
     * E.g. Don't set max-height or any of the properties that you find in {@link UISchemaUIElementElementLayoutBase}.
     *
     * Note that an expression is only sent to the host for interpretation if it starts with a prefix that the host set
     * on the ui-component (property `interpretedExpressionPrefix`).
     * By default, that prefix is unset, so nothing gets sent to the host for interpretation.
     *
     * @example
     * In this example the host would have set the `interpretedExpressionPrefix` to `#` to receive the css style `order` for interpretation.
     * ```json
     * style: {
     *      css_styles: {
     *          "text-align": "center",
     *          "background-color": "var(--col-bg-1)",
     *          "border-radius": "calc(1rem - 10px)"
     *          "border": "#context.get_error_border()"
     *          }
     * }
     *
     * */

    css_styles?: Record<string, string | InterpretedExpression>
}

/**
 * settings needed to describe how an element shows an identifier.
 * An identifier in the context of the ui-component is a link destination.
 * It represents a value that is semantically significant for the host.
 * The element renders a link of some sort that triggers the
 * component's gotoIdentifier callback.
 */
export type UISchemaIdentifierDisplay = true | {
    /** Optional. Instead of showing the actual identifier, resolves expression and shows the result */
    mask_identifier?: InterpretedExpression
}


/** typical setting for a dimension that allows to be a number (in which case the element decides on the unit),
 * the expression 'max' or a valid css setting that can include the unit, like "10rem" or so.
 * This basic version only accepts static css settings and nothing dynamic (like "calc(10px + 5vh)" or so)
 */
export type UISchemaUIElementLayoutDimension = number | 'max' | string


/** typical setting for a dimension that allows to be a number (in which case the element decides on the unit),
 * the expression 'max' or a valid css expression that will be interpreted at runtime (like "calc(10px + 5vh)" or so)
 */
export type UISchemaUIElementDynamicLayoutDimension = number | 'max' | UISchemaDynamicCSSExpression

/**
 * How an element is positioned in the layout.
 * The optional layout property defines how an element is positioned within its parent layout. All the attributes in this section are optional and
 * 💡 depend on the layout on which the element appears. So consult the description of the particular layout type (orchestration strategy) to find out about
 *    actual layout options.
 * */
export interface UISchemaUIElementElementLayoutBase {
    /** this can either be a number, in which case the unit depends on the element type, or 'max', in which case the element will
     be as wide as possible. Lookup the particular layout on which the element appears to find out about available options.*/
    min_width?: UISchemaUIElementLayoutDimension

    /** this can either be a number, in which case the unit depends on the element type, or 'max', in which case the element will
     be as tall as possible Lookup the particular layout on which the element appears to find out about available options. */
    min_height?: UISchemaUIElementLayoutDimension

    /** this can either be a number, in which case the unit is depends in the element type, or 'max', in which case the element can
     be as tall as possible Lookup the particular layout on which the element appears to find out about available options. */
    max_height?: UISchemaUIElementLayoutDimension

    /** this can either be a number, in which case the unit depends on the element type, or 'max', in which case the element can
     be as wide as possible. Lookup the particular layout on which the element appears to find out about available options. */
    max_width?: UISchemaUIElementLayoutDimension
}

// export interface UISchemaUIElementElementInColumnsLayout extends UISchemaUIElementElementLayoutBase {
//     /** optional number of columns this element spans within a columns orchestration strategy */
//     column_span?: number
// }

export interface UISchemaOrchestrationStrategyElementLayouts {
    "columns": UISchemaUIElementElementLayoutBase
    "scroll": UISchemaUIElementElementLayoutBase
}

export type UISchemaOrchestrationStrategyKeys = keyof UISchemaOrchestrationStrategyElementLayouts

/** padding settings (empty inner space between an elements border and the content) for an element.
 * All attributes in this section are optional. */
export interface UISchemaLayoutPadding {
    /** A number will be interpreted in pixels, a String can contain a css unit. E.g. "1rem" **/
    top?: number | UISchemaUIElementDynamicLayoutDimension
    /** A number will be interpreted in pixels, a String can contain a css unit. E.g. "1rem" **/
    end?: number | UISchemaUIElementDynamicLayoutDimension
    /** A number will be interpreted in pixels, a String can contain a css unit. E.g. "1rem" **/
    bottom?: number | UISchemaUIElementDynamicLayoutDimension
    /** A number will be interpreted in pixels, a String can contain a css unit. E.g. "1rem" **/
    start?: number | UISchemaUIElementDynamicLayoutDimension
}

//@discriminator element_type makes sure that ts-json-schema-generator
//generates an allOf and not an anyOf. The "element_type" is what determines the
//UISchemaElement that is actually being used.
/**
 * union type for all UIElement types. Every UIElement type must be listed here.
 * The particular element interface is distinguished by its static element_type setting
 * @discriminator element_type
 */
export type UISchemaUIElements =
    | UISchemaLayoutElement
    | UISchemaButton
    | UISchemaTextField
    | UISchemaDateTimeField
    | UISchemaLine
    | UISchemaComboBox
    | UISchemaDropDownSelection
    | UISchemaTemplateLabel
    | UISchemaBoolField
    | UISchemaFile

/**
 * special settings that LayoutElements use. This describes how the layout is rendering its elements.
 */
export interface UISchemaLayoutSettings<S extends UISchemaOrchestrationStrategyKeys = UISchemaOrchestrationStrategyKeys> {
    /** settings for how the layout renders its elements. Aka layout type. */
    orchestration_strategy: S

    /** if true all child elements will be set to readonly */
    readonly?: boolean

    /** all visible child elements must be listed here in order of their appearance within the layout.
     * If this is missing all elements will show in random order. */
    order?: string[]

    /** defines whether an element in the layout is visible if it does not have a visibility setting of its own. */
    default_element_visibility?: InterpretedExpression | boolean

    /** defines the room between elements. How this is interpreted depends on the particular orchestration stratefy, which defines the layout type */
    room?: NumberOrString
}

/**
 * Wraps any UI element (leaf or sub-layout) when placed inside a layout of strategy S,
 * attaching the strategy-specific layout positioning property.
 * @discriminator element_type
*/
export type UISchemaElementOnLayout<S extends UISchemaOrchestrationStrategyKeys> =
    UISchemaUIElements & {
    layout?: UISchemaOrchestrationStrategyElementLayouts[S]
}

export type UISchemaUILevels = 0 | 1 | 2 | 3

/**
 * A LayoutElement groups other elements (among which can be layouts again),
 * can have an appearance of its own and also controls data flow.
 */
export type UISchemaLayoutElement = {
    [S in UISchemaOrchestrationStrategyKeys]: UISchemaBaseUIElement &
    UISchemaLayoutSettings<S> & {
    element_type: 'layout'
    ui_level?: UISchemaUILevels
    ui_elements: Dictionary<UISchemaElementOnLayout<S>>
}
}[UISchemaOrchestrationStrategyKeys]

/**
 * The root element. Every ui schema must have one and it must be a UISchemaLayoutElement
 */
export type UISchemaUIRootLayoutElement = UISchemaLayoutElement & {
    /** optional spatial dimensions and positioning for the root layout element */
    layout?: UISchemaUIElementElementLayoutBase
}

// export interface UISchemaLayoutElement extends UISchemaBaseUIElement, UISchemaLayoutSettings<S> {
//     element_type: 'layout'
//
//     /** elements grouped in this layout */
//     ui_elements: Dictionary<UISchemaUIElements>
// }

/**
 * A Button element shows some type of button.
 */
export interface UISchemaButton extends UISchemaBaseUIElement {
    element_type: 'button'

    /** optional. Determines if a field can be navigated to (receive the focus). Default is true. */
    enabled?: InterpretedExpression | boolean

    /** the type of button determines the appearance */
    button_type: 'okButton' | 'cancelButton' | 'iconButton'

    /** for type iconButton: The icon, which must resolve to a FontAwesome icon code.*/
    icon?: InterpretedExpression

    /** optional setting that controls if a button is triggered when a user confirms or cancels by any other means than pressing the button.
     * E.g. and most common if the user presses ENTER or the ESC (CANCEL) on the keyboard while within the button's layout bounds. */
    default?: 'ENTER' | 'CANCEL'
}

/**
 * A text input field
 * ## style information
 💡 Note that `style properties` are in "em" by default, "max" is not supported in any dimension. otherwise see {@link UISchemaUIElementElementLayoutBase}
 */

export interface UISchemaTextField extends UISchemaBoundUIElement {
    /**
     * Determines if the element will show at all on the layout.
     * The default depends on the layout's default setting {@link UISchemaLayoutElement}.
     *
     * - Use `"."` to make this dependent on whether there is a value to display (no value -> element vanishes).
     * - Use an {@link InterpretedExpression} that the host can resolve to a boolean result.
     *
     */
    visible?: '.' | boolean | InterpretedExpression

    element_type: 'text_field'

    /**
     * Defines that the value represents an identifier.
     *
     * Either simply boolean `true` or a {@link UISchemaIdentifierDisplay} section that allows masking.
     * If absent, the value is not rendered or treated as an identifier.
     */
    display_identifier?: UISchemaIdentifierDisplay

    /** settings to limit the text length */
    ellipsis?: UISchemaDisplayEllipsis

    /** is this a multiline field, so should line feeds or carriage returns be accepted? */
    multiline?: boolean
}

/** settings to limit the text length and format the way the ellipsis is displayed */
export interface UISchemaDisplayEllipsis {
    max_characters: number
}

/**
 * A DateTime field that allows a user to input and select a date and optionally a time, too
 */
export interface UISchemaDateTimeField extends UISchemaBoundUIElement {
    element_type: 'date_time_field'

    /** leave date_format out unless you want to set it to latin. In that case the date format will look like dd.xx.yyyy with xx being the latin number for the month  */
    date_format?: 'latin'

    /** set to true if you actually want to include a time input field */
    include_time?: boolean
}

/**
 * Elements that allow this property can be used as template elements.
 * A template element can occur more than once in the "order" list in {@link UISchemaLayoutSettings} and so appear multiple times on the layout.
 * They will not get included in the ... placeholder, though.
 */
export type UISchemaUIElementTemplate = {is_template?: true}

/**
 * A horizontal line. Lines can be template elements. See {@link UISchemaUIElementTemplate}
 */
export type UISchemaLine = UISchemaBaseUIElement & UISchemaUIElementTemplate & {
    element_type: 'line'

    /** if set the element does not show the line but acts as a horizontal spacer */
    transparent?: boolean
}

/**
 * A combobox element (drop down list combined with an input element) that allows typing and selecting values
 * This is the element that allows for dynamic and lazy loading of the list contents.
 * Note that the combobox element does not have a value attribute! The value of the
 * element is directly pulled from the binding.
 * See {@link UISchemaUIElementBinding}
 *
 * Note that there is also a drop-down selection: {@link UISchemaDropDownSelection}
 */
export interface UISchemaComboBox extends Omit<UISchemaBoundUIElement, 'value'> {
    element_type: 'combo-box'
    /** Either a list of static selection values, defined in the schema,
     * or dynamic list values set via UISchemaFullLookupSettings
     * UISchemaDynamicLookupSettings is not yet implemented but supposed to
     * support lazy and filtered lookups when available.
     * */
    items: Array<string> | Array<[string,string]> | UISchemaFullLookupSettings
}

/**
 * A drop-down selection element (drop down list without an input element) selecting a value from a list.
 * This element loads the selection list only once and assumes it is static. If you need something more dynamic or lazy, use the combo-box element.
 * Note that there is no "value" property for this element. The value is directly pulled from the database binding.
 * See {@link UISchemaUIElementBinding}
 */
export interface UISchemaDropDownSelection extends Omit<UISchemaBoundUIElement, 'value'> {
    element_type: 'drop-down-selection'
    /** Either a list of static selection values, defined in the schema,
     * or dynamic list values set via UISchemaFullLookupSettings */
    items: Array<string> | Array<[string,string]> | UISchemaFullLookupSettings
}

/**
 * settings that are used to fetch values for a static selection list from the data provider.
 * This is not for lazy loading or paged lists. This loads all elements at once.
 */
export interface UISchemaFullLookupSettings {
    topic: string
}

/**
 * a label that shows a dynamic value but has no input functionality.
 * Note that enabled or readonly have no impact on this element.
 */
export type UISchemaTemplateLabel = UISchemaDynamicUIElement & {
    element_type: 'template_label'

    /**
     * Defines that the value represents an identifier.
     *
     * Either simply boolean `true` or a {@link UISchemaIdentifierDisplay} section that allows masking.
     * If absent, the value is not rendered or treated as an identifier.
     */
    display_identifier?: UISchemaIdentifierDisplay
}

/**
 * An input element that allows to set a boolean state (presumably a checkbox)
 * In read-only state it shows YES or NO instead of a checkbox.
 * */
export interface UISchemaBoolField extends UISchemaBoundUIElement {
    element_type: 'bool'
}


/**
 * An element that shows a file. While the File is a dynamic value, it does not have input capabilities.
 * */
export interface UISchemaFile extends UISchemaDynamicUIElement {
    element_type: 'file'
    resolution: string
    alternate_description?: string
    file_description?: 'right' | 'bottom' | 'none'
    align_image?: 'center' | 'left'
    fit_content?: 'contain' | 'fit' | 'scale'
}
