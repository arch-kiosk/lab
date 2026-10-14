import { customElement } from 'lit/decorators.js'
import { html, LitElement, unsafeCSS } from 'lit'
import { createRef, Ref, ref } from 'lit/directives/ref.js'
// import local_css from "./styles/lab-app.sass?inline"
import './uicomponent'
import { UIComponent } from './uicomponent'
import { configureTestSchema1TypeLayout } from '#src/testschemas/test-1typelayout'
import { configureTestSchemaVirtualScrollLayout } from '#src/testschemas/test-virtualscrolllayout'

@customElement('ui-component-test-app')
export class UIComponentTestApp extends LitElement {
    // static styles = unsafeCSS(local_css)
    // private dataProvider = new ConcreteDataProvider(10, 3)

    static styles = unsafeCSS(`
        #ui2::part(text_field) {
            --ui-col-bg-1-input: black;
            --ui-col-primary-bg-1: contrast-color(var(--ui-col-bg-1-input));
        }
    `)
    uiComponentRef1: Ref<UIComponent> = createRef()
    uiComponentRef2: Ref<UIComponent> = createRef()

    updated() {
        const uiComponent1 = this.uiComponentRef1.value
        if (uiComponent1) configureTestSchemaVirtualScrollLayout(uiComponent1)
        const uiComponent2 = this.uiComponentRef2.value
        if (uiComponent2) configureTestSchema1TypeLayout(uiComponent2)
        // if (uiComponent) configureTestSchema1TypeLayout(uiComponent)

    }

    render() {
        return html`
            <style>
                
            </style>
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
                        ${ref(this.uiComponentRef1)}
                        id="ui1"
                        style="border: 2px solid cornflowerblue"
                >
                </ui-component>
                <ui-component
                        style="margin-inline-start: 1em"
                        ${ref(this.uiComponentRef2)}
                        id="ui2"
                        style="border: 2px solid cornflowerblue"
                >
                </ui-component>
            </div>
        `
    }
}
