import {UIElement} from "./uielements/uielement";

export interface UIElementFactory {
    getUIElementClass(elementTypeName: string): typeof UIElement
}

export class UIConfigurableElementFactory implements UIElementFactory {
    private _elementClasses:{ [key: string]: typeof UIElement } = {};

    addUIElementClass(elementTypeName: string, elementClass: typeof UIElement) {
        this._elementClasses[elementTypeName.toLowerCase()] = elementClass
    }
    getUIElementClass(elementTypeName: string): typeof UIElement{
        const elementClass = this._elementClasses[elementTypeName.toLowerCase()]
        if (!elementClass)
            throw `UIConfigurableElementFactory.getUIElementClass: no element class for ${elementTypeName}`

        return elementClass
    }

}