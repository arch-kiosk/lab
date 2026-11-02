---
description: 'The ui schema is a json data structure that defines what a layout looks like and how it behaves.'
---

# ui schema reference

The ui schema is a json data structure that defines what a layout looks like and how it behaves.
## ui schema uml diagram
(click to open)  
  
[![ui-component ui schema](/assets/uischema.svg)](/assets/uischema.svg)

## Curated Schema Documentation
A schema definition starts with the base level information described in [UISchema](/api/interfaces/UISchema.md).
First of all you must describe the data source to the component via the `data_binding`. Most important is the `cardinality` as it defines whether the data provider is providing one record or several. According to this setting you chose either a "1"-type layout or a "N"-type layout as root element.

The actual ui description starts with the root element, which must point to a Layout description [see UISchemaUIRootLayoutElement](/api/interfaces/UISchemaUIRootLayoutElement.md).  
The root layout can be either a "1" type layout or a "N" type layout, depending on whether the data provider for a certain use case serves N records or only one record.  

In case of a "N-type record" the only element of the root layout would have to be a "1"-type layout. That "1".type layout holds the actual ui elements.
  
So either way you get to an ui_elements dictionary either in the root layout or in the "1"-type layout that lists what elements are actually offered by the user interface.
All ui elements derive from UISchemaBaseUIElement. Simple graphical elements like a static line are direct descendant and do not interact with the live data.  
  
That is why most ui elements derive from UISchemaDynamicElement to interact with the dataprovider.  
  

  - Independent of the actual element type elements can define these basic attributes: [basic ui element attributes](/api/interfaces/UISchemaBaseUIElement.md).
  - layout elements are special in that they both have their own visual appearance and render and group other ui elements. Basics about layout elements (also the root element) are described here: [layout element basics](/api/interfaces/UISchemaLayoutElement.md)
  - there are a few simple elements that render something static (like a line), but most elements are "dynamic" ui elements which range from simple labels to quite complex drop down lists. Their attributes are documented in their respective articles and you find the list of current dynamic ui element types here: [UISchemaLayoutElements](/api/type-aliases/UISchemaUIElements)  
   
  


## Full schema reference:

- [UISchema](/api/interfaces/UISchema.md)
