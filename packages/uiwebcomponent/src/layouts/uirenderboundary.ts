import { LitElement, html} from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TemplateResultOrNothing } from '#src/sharedtypes'

@customElement('ui-render-boundary')
export class UIRenderBoundary extends LitElement {
    // Pass a closure that returns the template to be evaluated
    @property({ attribute: false }) renderContent?: (boundary: LitElement) => TemplateResultOrNothing

    protected createRenderRoot() {
        return this // Light DOM so layout flex/grid CSS continues to work
    }

    override connectedCallback() {
        super.connectedCallback();
        //Make sure this does not at all act in the layout so it's children can behave as if it weren't in the DOM at all.
        this.style.display = 'contents';
    }

    protected render() {
        console.log("rerendering boundary")
        return this.renderContent ? this.renderContent(this) : html``
    }
}