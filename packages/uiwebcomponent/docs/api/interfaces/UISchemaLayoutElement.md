[@arch-kiosk/uicomponent](../index.md) / UISchemaLayoutElement

# Interface: UISchemaLayoutElement

Defined in: [uischema.ts:102](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L102)

## Extends

- [`UISchemaUIElementType`](UISchemaUIElementType.md).[`UILayout`](UILayout.md)

## Properties

### default?

> `optional` **default?**: `"ENTER"` \| `"CANCEL"`

Defined in: [uischema.ts:99](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L99)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`default`](UISchemaUIElementType.md#default)

---

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [uischema.ts:88](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L88)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`enabled`](UISchemaUIElementType.md#enabled)

---

### extra_style?

> `optional` **extra_style?**: `string`

Defined in: [uischema.ts:96](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L96)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`extra_style`](UISchemaUIElementType.md#extra-style)

---

### is_identifier?

> `optional` **is_identifier?**: `boolean`

Defined in: [uischema.ts:89](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L89)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`is_identifier`](UISchemaUIElementType.md#is-identifier)

---

### layout?

> `optional` **layout?**: [`UISchemaUIElementLayoutSettings`](UISchemaUIElementLayoutSettings.md)

Defined in: [uischema.ts:104](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L104)

---

### layout_settings?

> `optional` **layout_settings?**: [`UISchemaLayoutSettings`](UISchemaLayoutSettings.md)

Defined in: [uischema.ts:21](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L21)

#### Inherited from

[`UILayout`](UILayout.md).[`layout_settings`](UILayout.md#layout-settings)

---

### mask_identifier?

> `optional` **mask_identifier?**: `string`

Defined in: [uischema.ts:90](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L90)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`mask_identifier`](UISchemaUIElementType.md#mask-identifier)

---

### max_characters?

> `optional` **max_characters?**: `number`

Defined in: [uischema.ts:92](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L92)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`max_characters`](UISchemaUIElementType.md#max-characters)

---

### name

> **name**: `"layout"`

Defined in: [uischema.ts:103](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L103)

#### Overrides

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`name`](UISchemaUIElementType.md#name)

---

### padding?

> `optional` **padding?**: `string` \| `number` \| [`UISchemaLayoutPadding`](UISchemaLayoutPadding.md)

Defined in: [uischema.ts:97](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L97)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`padding`](UISchemaUIElementType.md#padding)

---

### readonly?

> `optional` **readonly?**: `boolean`

Defined in: [uischema.ts:98](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L98)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`readonly`](UISchemaUIElementType.md#readonly)

---

### style?

> `optional` **style?**: `object`

Defined in: [uischema.ts:95](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L95)

#### Index Signature

\[`key`: `string`\]: `string`

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`style`](UISchemaUIElementType.md#style)

---

### text?

> `optional` **text?**: `string`

Defined in: [uischema.ts:91](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L91)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`text`](UISchemaUIElementType.md#text)

---

### ui_elements

> **ui_elements**: [`Dictionary`](Dictionary.md)\<[`UISchemaUIElement`](UISchemaUIElement.md)\>

Defined in: [uischema.ts:22](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L22)

#### Inherited from

[`UILayout`](UILayout.md).[`ui_elements`](UILayout.md#ui-elements)

---

### value?

> `optional` **value?**: `string`

Defined in: [uischema.ts:93](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L93)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`value`](UISchemaUIElementType.md#value)

---

### visible?

> `optional` **visible?**: `string`

Defined in: [uischema.ts:94](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/uischema.ts#L94)

#### Inherited from

[`UISchemaUIElementType`](UISchemaUIElementType.md).[`visible`](UISchemaUIElementType.md#visible)
