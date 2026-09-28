import { customElement } from 'lit/decorators.js'
import { html, LitElement } from 'lit'
import { createRef, Ref, ref } from 'lit/directives/ref.js'
// import local_css from "./styles/lab-app.sass?inline"
import './uicomponent'
import { UIComponent } from './uicomponent'
import { configureTestSchemaVirtualScrollLayout } from '#src/testschemas/test-virtualscrolllayout'

@customElement('ui-component-test-app')
export class UIComponentTestApp extends LitElement {
    // static styles = unsafeCSS(local_css)
    // private dataProvider = new ConcreteDataProvider(10, 3)
    uiComponentRef: Ref<UIComponent> = createRef()

    updated() {
        const uiComponent = this.uiComponentRef.value
        if (uiComponent) configureTestSchemaVirtualScrollLayout(uiComponent)

    }

    render() {
        return html`
            <div style="font-size: 24px">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi ducimus excepturi
                facilis fugit laboriosam necessitatibus perspiciatis quas voluptate? Ab accusantium
                alias aliquid aspernatur debitis dolor itaque provident quis quisquam temporibus.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi ducimus excepturi
                facilis fugit laboriosam necessitatibus perspiciatis quas voluptate? Ab accusantium
                alias aliquid aspernatur debitis dolor itaque provident quis quisquam temporibus.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi ducimus excepturi
                facilis fugit laboriosam necessitatibus perspiciatis quas voluptate? Ab accusantium
                alias aliquid aspernatur debitis dolor itaque provident quis quisquam temporibus.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi ducimus excepturi
                facilis fugit laboriosam necessitatibus perspiciatis quas voluptate? Ab accusantium
                alias aliquid aspernatur debitis dolor itaque provident quis quisquam temporibus.
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Animi ducimus excepturi
                facilis fugit laboriosam necessitatibus perspiciatis quas voluptate? Ab accusantium
                alias aliquid aspernatur debitis dolor itaque provident quis quisquam temporibus.
            </div>
            <button onclick="gotoRecord(5)">goto record 5</button>
            <div style="display: flex; padding: 5em">
                <ui-component
                        ${ref(this.uiComponentRef)}
                        id="ui"
                        style="border: 2px solid cornflowerblue"
                >
                </ui-component>
            </div>
        `
    }
}
