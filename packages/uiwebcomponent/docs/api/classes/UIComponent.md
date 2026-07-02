[@arch-kiosk/uicomponent](../index.md) / UIComponent

# Class: UIComponent

Defined in: [ui-component.ts:49](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L49)

## Extends

- `LitElement`

## Constructors

### Constructor

> **new UIComponent**(): `UIComponent`

Defined in: [ui-component.ts:96](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L96)

#### Returns

`UIComponent`

#### Overrides

`LitElement.constructor`

## Other

### \_dsd_to_element_list

> **\_dsd_to_element_list**: `object` = `{}`

Defined in: [ui-component.ts:53](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L53)

#### Index Signature

\[`key`: `string`\]: [`UISchemaUIElementWithId`](../interfaces/UISchemaUIElementWithId.md)

---

### \_element_list

> **\_element_list**: `object` = `{}`

Defined in: [ui-component.ts:54](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L54)

#### Index Signature

\[`key`: `string`\]: [`UISchemaUIElement`](../interfaces/UISchemaUIElement.md)

---

### \_messages

> **\_messages**: `object` = `{}`

Defined in: [ui-component.ts:52](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L52)

#### Index Signature

\[`key`: `string`\]: `object`

---

### \_selection_data

> **\_selection_data**: `object` = `{}`

Defined in: [ui-component.ts:55](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L55)

#### Index Signature

\[`key`: `string`\]: `object`

---

### \_showError

> **\_showError**: `string` \| `null` = `null`

Defined in: [ui-component.ts:92](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L92)

---

### data

> **data**: [`UIInputData`](../type-aliases/UIInputData.md) = `{}`

Defined in: [ui-component.ts:71](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L71)

---

### dataProvider

> **dataProvider**: [`UIComponentDataProvider`](../type-aliases/UIComponentDataProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:77](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L77)

---

### fetchFileProvider

> **fetchFileProvider**: [`UIComponentFetchFileProvider`](../type-aliases/UIComponentFetchFileProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:89](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L89)

---

### linkIdentifiers

> **linkIdentifiers**: `boolean` = `true`

Defined in: [ui-component.ts:65](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L65)

---

### lookupProvider

> **lookupProvider**: [`UISchemaLookupProvider`](../type-aliases/UISchemaLookupProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:74](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L74)

---

### moveToNextRow

> **moveToNextRow**: [`UIComponentMoveToNextRowProvider`](../type-aliases/UIComponentMoveToNextRowProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:83](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L83)

---

### setSortOrder

> **setSortOrder**: [`UIComponentSetSortOrderProvider`](../type-aliases/UIComponentSetSortOrderProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:86](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L86)

---

### showDevelopmentInfo

> **showDevelopmentInfo**: `boolean` = `false`

Defined in: [ui-component.ts:68](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L68)

---

### timeZoneInfoProvider

> **timeZoneInfoProvider**: [`UIComponentTimeZoneInfoProvider`](../type-aliases/UIComponentTimeZoneInfoProvider.md) \| `null` = `null`

Defined in: [ui-component.ts:80](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L80)

---

### uiSchema

> **uiSchema**: [`UISchema`](../interfaces/UISchema.md) \| `null` = `null`

Defined in: [ui-component.ts:62](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L62)

---

### comboBoxFilterChanged()

> **comboBoxFilterChanged**(`e`): `void`

Defined in: [ui-component.ts:379](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L379)

#### Parameters

##### e

`ComboBoxFilterChangedEvent`

#### Returns

`void`

---

### fetchFile()

> **fetchFile**(`event`): `void`

Defined in: [ui-component.ts:306](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L306)

#### Parameters

##### event

`CustomEvent`

#### Returns

`void`

---

### fieldChanged()

> **fieldChanged**(`e`): `void`

Defined in: [ui-component.ts:368](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L368)

#### Parameters

##### e

`Event`

#### Returns

`void`

---

### fieldChangedById()

> **fieldChangedById**(`id`): `void`

Defined in: [ui-component.ts:357](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L357)

#### Parameters

##### id

`string`

#### Returns

`void`

---

### gatherData()

> **gatherData**(): `object`

Defined in: [ui-component.ts:297](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L297)

#### Returns

`object`

---

### get_field_value()

> **get_field_value**(`id`, `element`): `any`

Defined in: [ui-component.ts:314](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L314)

#### Parameters

##### id

`string`

##### element

[`UISchemaUIElement`](../interfaces/UISchemaUIElement.md)

#### Returns

`any`

---

### getPaddingStyle()

> **getPaddingStyle**(`padding?`): `string`

Defined in: [ui-component.ts:463](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L463)

#### Parameters

##### padding?

`string` \| `number` \| [`UISchemaLayoutPadding`](../interfaces/UISchemaLayoutPadding.md)

#### Returns

`string`

---

### getSchemaElement()

> **getSchemaElement**(`id`): [`UISchemaUIElement`](../interfaces/UISchemaUIElement.md)

Defined in: [ui-component.ts:167](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L167)

#### Parameters

##### id

`string`

#### Returns

[`UISchemaUIElement`](../interfaces/UISchemaUIElement.md)

---

### getSelectionValue()

> **getSelectionValue**(`id`, `domElement`, `comboBox`): `any`

Defined in: [ui-component.ts:328](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L328)

#### Parameters

##### id

`string`

##### domElement

`HTMLFormElement` \| `null`

##### comboBox

[`UISchemaComboBox`](../interfaces/UISchemaComboBox.md)

#### Returns

`any`

---

### gotoIdentifier()

> **gotoIdentifier**(`event`): `void`

Defined in: [ui-component.ts:502](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L502)

#### Parameters

##### event

`PointerEvent`

#### Returns

`void`

---

### gotoRecord()

> **gotoRecord**(`uid`): `boolean`

Defined in: [ui-component.ts:193](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L193)

#### Parameters

##### uid

`string`

#### Returns

`boolean`

---

### hideDevelopmentInfo()

> **hideDevelopmentInfo**(): `void`

Defined in: [ui-component.ts:498](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L498)

#### Returns

`void`

---

### keyupOnElement()

> **keyupOnElement**(`e`): `void`

Defined in: [ui-component.ts:109](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L109)

#### Parameters

##### e

`KeyboardEvent`

#### Returns

`void`

---

### processSchemaDefinition()

> **processSchemaDefinition**(): `void`

Defined in: [ui-component.ts:229](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L229)

#### Returns

`void`

## rendering

### render()

> **render**(): `TemplateResult`

Defined in: [ui-component.ts:513](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L513)

Invoked on each update to perform rendering tasks. This method may return
any value renderable by lit-html's `ChildPart` - typically a
`TemplateResult`. Setting properties inside this method will _not_ trigger
the element to update.

#### Returns

`TemplateResult`

#### Overrides

`LitElement.render`

## updates

### firstUpdated()

> **firstUpdated**(`_changedProperties`): `void`

Defined in: [ui-component.ts:119](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L119)

Invoked when the element is first updated. Implement to perform one time
work on the element after update.

```ts
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

Setting properties inside this method will trigger the element to update
again after this update cycle completes.

#### Parameters

##### \_changedProperties

`any`

Map of changed properties with old values

#### Returns

`void`

#### Overrides

`LitElement.firstUpdated`

---

### updated()

> **updated**(`_changedProperties`): `void`

Defined in: [ui-component.ts:163](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L163)

Invoked whenever the element is updated. Implement to perform
post-updating tasks via DOM APIs, for example, focusing an element.

Setting properties inside this method will trigger the element to update
again after this update cycle completes.

#### Parameters

##### \_changedProperties

`any`

Map of changed properties with old values

#### Returns

`void`

#### Overrides

`LitElement.updated`

---

### willUpdate()

> `protected` **willUpdate**(`_changedProperties`): `void`

Defined in: [ui-component.ts:102](https://github.com/arch-kiosk/lab/blob/633cee5266d9ea6761b360bf671cc29a4dd2782d/packages/uiwebcomponent/src/ui-component.ts#L102)

Invoked before `update()` to compute values needed during the update.

Implement `willUpdate` to compute property values that depend on other
properties and are used in the rest of the update process.

```ts
willUpdate(changedProperties) {
  // only need to check changed properties for an expensive computation.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

#### Parameters

##### \_changedProperties

`PropertyValueMap`\<`any`\> \| `Map`\<`PropertyKey`, `unknown`\>

#### Returns

`void`

#### Overrides

`LitElement.willUpdate`
