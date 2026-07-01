import {UIElement} from "./uielement";
import {nothing, html} from "lit";
import {UIElementRenderContext} from "../uielementrendercontext";
import {UISchemaFile} from "../uischema";

export class UIElementFile extends UIElement {
    static renderLabel(context: UIElementRenderContext, id: string, text: string) {
        return (context.layouter.renderElementLabels) ? html`
            <label for="${id}">${text}
                ${this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)}
            </label>
        ` : this.devInfo(context, context.entry.element_type.text, context.entry.element_type.value)
    }

    static render(context: UIElementRenderContext, id: string) {
        try {
            // let value = this.haulData(context, context.entry.element_type.value)
            // if (!this.isVisible(context, value)) {
            //     return html`${nothing}`
            // }
            let value = this.haulData(context, context.entry.element_type.value)
            let text = this.haulData(context, context.entry.element_type.text)
            let descriptionObject = this.haulData(context, `#($/images/descriptions/${value})`)
            let description: string = ""
            let width: number = 0
            let height: number = 0
            let htmlClass = this.getStyleSetting(context.entry.element_type, "classes", "")
            let cssStyle = this.addStyle("", this.getStyleTextAlign(context.entry.element_type))
            let imageElement = context.entry.element_type as UISchemaFile
            let alignFileDescription = imageElement.file_description || "bottom"

            console.log(descriptionObject)
            if (typeof descriptionObject === "string") {
                description = descriptionObject
            } else {
                if (descriptionObject?.hasOwnProperty("description")) {
                    description = descriptionObject["description"]
                }
                if (descriptionObject?.hasOwnProperty("attributes")) {
                    height = descriptionObject.attributes?.height ?? 0
                    width = descriptionObject.attributes?.width ?? 0
                }
            }

            if (context.entry.layout?.max_height) {
                cssStyle = this.addStyle(cssStyle, `max-height: ${context.entry.layout.max_height === "max"? "" : context.entry.layout.max_height + "px"}`)
            }
            if (context.entry.layout?.max_width) {
                cssStyle = this.addStyle(cssStyle, `max-width: ${context.entry.layout.max_width === "max"? "" : context.entry.layout.max_width + "px"}`)
            }
            // if (!value && !description) {
            //     return html`${nothing}`
            // }

            return context.layouter.renderElement(context.entry.layout, html`
                ${this.renderLabel(context, id, text)}
                <div style="${cssStyle ? cssStyle : nothing}" class="read-only-image ${htmlClass}">
                    <div class="${(imageElement.align_image === "left" || imageElement.fit_content === "scale")?'image-left-align':'image-center'}">
                        ${value?html`
                                <file-view 
                                id="${value}" 
                                uuid_file="${value}" 
                                resolution="${imageElement.resolution}" 
                                description=${description} 
                                fitcontent="${imageElement.fit_content || 'contain'}"
                                @fetchfile="${context.uicomponent.fetchFile}"
                                data-width="${width}" data-height="${height}">
                        </file-view>`:html`
                            <div class="file-broken">
                                <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="100%" height="100%"
                                     viewBox="0 0 512 512">
                                    <path d="M380.993 512c-59.343 0-107.624-48.279-107.624-107.622V276.455c0-9.425 7.641-17.067 17.067-17.067s17.067 7.641 17.067 17.067v127.923c0 40.522 32.968 73.489 73.49 73.489 9.425 0 17.067 7.641 17.067 17.067S390.419 512 380.993 512z"
                                        style="fill:var(--col-bg-att-lighter)"/>
                                    <path d="M388.37 432.62c-30.071 0-54.536-24.465-54.536-54.536V230.086c0-9.425 7.641-17.067 17.067-17.067 9.425 0 17.067 7.641 17.067 17.067v147.999c0 11.25 9.152 20.403 20.403 20.403s20.403-9.152 20.403-20.403v-63.243c0-9.425 7.641-17.067 17.067-17.067h43.217c9.425 0 17.067 7.641 17.067 17.067 0 9.425-7.641 17.067-17.067 17.067h-26.151v46.177c-.002 30.069-24.465 54.534-54.537 54.534z"
                                          style="fill:var(--col-bg-att)"/>
                                    <path d="M131.007 512c-9.425 0-17.067-7.641-17.067-17.067s7.641-17.067 17.067-17.067c40.522 0 73.49-32.967 73.49-73.489V276.455c0-9.425 7.641-17.067 17.067-17.067 9.425 0 17.067 7.641 17.067 17.067v127.923C238.63 463.721 190.35 512 131.007 512z"
                                          style="fill:var(--col-bg-att-darker)"/>
                                    <path d="M123.63 434.307c-30.071 0-54.536-24.465-54.536-54.536v-46.177H42.943c-9.425 0-17.067-7.641-17.067-17.067 0-9.425 7.641-17.067 17.067-17.067H86.16c9.425 0 17.067 7.641 17.067 17.067v63.243c0 11.25 9.152 20.403 20.403 20.403s20.403-9.152 20.403-20.403V230.085c0-9.425 7.641-17.067 17.067-17.067s17.067 7.641 17.067 17.067v149.686c-.001 30.071-24.466 54.536-54.537 54.536z"
                                          style="fill:var(--col-bg-att-darker)"/>
                                    <path d="M256 299.824c-37.646 0-73.647-17.92-101.375-50.459-25.857-30.345-40.686-69.456-40.686-107.305C113.94 63.728 177.667 0 256 0s142.06 63.728 142.06 142.06c0 37.849-14.829 76.96-40.686 107.305-27.727 32.539-63.728 50.459-101.374 50.459z"
                                          style="fill:var(--col-bg-att-lighter)"/>
                                    <path d="M256 0v299.824c37.646 0 73.647-17.92 101.375-50.459 25.857-30.345 40.686-69.456 40.686-107.305C398.06 63.728 334.333 0 256 0z"
                                          style="fill:var(--col-bg-att-darker)"/>
                                    <circle cx="209.328" cy="226.702" r="22.577" style="fill:#555c5e"/>
                                    <circle cx="302.672" cy="226.702" r="22.577" style="fill:#555c5e"/>
                                </svg>
                        </div>`}
                    </div>
                    ${(alignFileDescription === "bottom" && description)?html`
                            <div class="file-element-description">${description}</div>
                        `:nothing}
                </div>
            `)
        } catch (e) {
            console.error(`UIElementFile.render: ${e} with context`, context)
            throw e
        }
    }
}