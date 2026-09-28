import { LitElement, html, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('ui-render-boundary')
export class UIRenderBoundary extends LitElement {
    // Pass a closure that returns the template to be evaluated
    @property({ attribute: false }) renderContent?: (boundary: LitElement) => TemplateResult

    protected createRenderRoot() {
        return this // Light DOM so layout flex/grid CSS continues to work
    }

    protected render() {
        console.log("rerendering boundary")
        return this.renderContent ? this.renderContent(this) : html``
    }
}