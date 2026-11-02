---
description: 'The ui schema is a json data structure that defines what a layout looks like and how it behaves.'
---

# ui component styling
## Overview
Styling user interfaces with the ui-component follows a DRY strategy: Apply only absolute use-case specific by mans of the schema itself. 
This should be by and large the exception. Instead the user interface follows theme styles. There are three tiers of styling the ui-component itself (instead of the individual content, which would be using the schema definition): 

  1. The CSS-Variables Tier: styling defined attributes exposed by the css api  
This is the preferred way of theming the component. It itself has two different tiers: using global css variables and instance variables. 
  1. The By-Part-Styling Tier: Styling defined html parts 
There are defined parts within the component's DOM that can be targetted by css selectors on the consumer side.
  1. The Injection Tier: Injecting css classes and styles 
This should almost never be necessary. It allows to manipulate the component's inner DOM with injected css. This allows you to override almost all styles and introduce new styles into the component.

## style precedence
  1. Styles defined in the schema (particularly through `css_styles`) are applied directly to the DOM elements, so they should always win. The same is true vor some schema attributes like `visbility`. 
  1. Using `css_classes` in the schema (rather meant to be useful in combination with the Injection Tier) follows css precedence rules triggered by the class in question. 
  1. Injection can override almost all the inner css of the component, so it can be made to take precedent. 
  1. As Part styling targets HTML it can have higher priority than styling by css variables because it can simply override the attributes that use css variables with static values. But it can, and should, also use css-variables to avoid hardcoded styles values.
  1. Css-variables can be overridden by the other methods but not the other way around. They are either being used by html and css or they are ineffective. However, they should be the preferred way of styling. 

## css color system
### structure of color css variables
#### color targets
The ui-component uses a semantic color system. There are three targets that an ui element can consume: Foreground, Background and Border.
#### levels and layouts
Moreover the colors are organized in levels. Think of levels as z-indexes for colors. There are 4 levels: l0 to l3. l0 means we are on "body" level, the most background layer, the other levels pile on that like layers in photoshop. 
What level ui elements appear on is defined by their parent layout. Within the same level only the colors of that level are available. That is why the color css-variables inside the component drop the level (the ui-element knows on which level it appears)  
while styling those colors needs the level.
#### global and local variables: `--uic-col` vs `--col`
You can use two different variables to style the same color: a global or a local one.  
The idea here is that the `global color css-variables` are defined for ALL instances of the ui-component used by the host. Think of it as host-wide or app-wide theming. 
It should be the preferred way of styling so that the ui in the app looks homogenous. **Global color css-variables start with `--col-`.**  
**`Local color css-variables` start with `--uic-col-`**. They set a color for all elements of a single instance of the ui-component. 
Local take precedent over global settings. 
### shape of color css variable expressions
#### background color css variables 
  - Background color variables have the shape `\[--uic-\]col-{level}-bg{[-background purpose]}{[-variant]}`.  
  - *Background purposes* are `button`, `input`, `ack`, `warn`, `alert`. The standard background has no purpose and is the default.  
So `--col-l0-bg` addresses the standard background while `--col-l0-bg-input` addresses the background of an input element.       
  - IF you want to change the *lighter or darker variant* of a background, use the variant `-lt` or `-dk` as the optional last part of the shape. 
The lighter or darker version of a background color is otherwise computed automatically by mixing with 20% of white or 10% of black.  
Sometimes the contrasts are too extreme and you want to target the one version of the color that is off. Only target what needs an individual setting, leave the rest at the defaults.     


#### foreground color css variables 
  - Foreground color css variables have the shape `\[--uic-\]col-{level}-{foreground purpose}\[-{background purpose}\]`.  
  - Foreground colors are usually used as text color but meant to be used by everything that isn't a background or a border.
  - Foreground colors are specific to a background. That is why each foreground color css-variable ends on a background purpose.
  - **Foreground purposes** are `primary`, `accent`, `ack`, `warn`, `alert`  
The exception is the foreground color on the standard background: It omits the background. So `--col-l0-primary` defines the primary foreground color for the standard background while `--col-l0-primary-input` defines the primary text color for input elements.  

####  border color css variables
  - border color css variables have the shape `\[--uic-\]col-{level}-bd-{variant}\[-{border purpose}\]`.
  - Here the variant is obligatory. **Variants are** `-lt` and `-dk`. Borders don't come with a "normal" variant. Think of them as the two colors needed for a beveled border. 
  - Note that **border purposes** use the same literals as background purposes: `button`, `input`, `ack`, `warn`, `alert`. No purpose leads to the standard border. So 
`-col-l0-bd-lt` addresses the lighter variant of a neutral border while `-col-l0-bd-lt-ack` is the lighter variant of a border signaling success. 
  
### how the three types of color css-variables work together
Foreground colors and background colors belong together. The ui will not put the accent color of an alert background on a standard background. So with `--col-l0-accent-alert` you set the foreground color on an alert background when something gets emphasized.  
Border colors are different. `--col-l0-bd-lt-alert` is supposed to work on all background purposes, but particularly on the standard background. It is being used to put an alert border around something that needs attention. 
E.g. the input control of an invalid value will get a border `--col-l0-bd-dk-input` to signal an error. So the borders are NOT the borders that belong to the background purpose.   
⚠️ On the contrary: You will not find a `--col-l0-bd-lt-alert` border on a `--col-l0-bg-alert` background as they often have very similar colors.     

### defaults
  - If you define no color css-variable, the ui-component will use a default palette, shown below in the color matrix.
  - Unless explicitly set, `-lt` and `-dk` variants of background are automatically generated mixing either 20% white or 10% black.
  - Unless explicitly set, border colors are automatically generated as either lighter or darker versions of the background of the same purpose. 
So `--col-l0-bd-lt-alert` has 20% white mixed into `--col-l0-bg-alert`. It does not use the lighter or darker variant of the background, even if explicitly set.     

### color matrix
⚠️ Note that the matrix shows the variable names that the ui-component uses internally. Those css-variables do not have a level.   
If you style a part or use css injection and want to use a certain css variable, always omit the level. It is the layout that will decide at runtime what level of colors to chose. 
The layout either uses level 0 by default or you set an explicit level: 
``` jsonc
                sub_layout: {
                    element_type: 'layout',
                    orchestration_strategy: 'columns',
                    ui_level: 1,
                // ...
```
<br>         
   
💡 The color matrix below shows the default colors for level 0.
  
[![ui-component css color system](/assets/ui-component-color-system.png)](/assets/ui-component-color-system.png)
