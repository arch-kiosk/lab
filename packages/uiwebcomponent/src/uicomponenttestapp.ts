import { customElement, state } from 'lit/decorators.js'
import { html, LitElement, unsafeCSS } from 'lit'
import { createRef, Ref, ref } from 'lit/directives/ref.js'
import local_css from "./styles/lap-app.sass?inline"
import './uicomponent'
import { UIComponent } from './uicomponent'
import "./localeselect"
import { configureTestSchema1TypeLayout } from '#src/testschemas/test-1typelayout'
import { configureTestSchemaVirtualScrollLayout } from '#src/testschemas/test-virtualscrolllayout'
import { buildColorMatrix, renderColorMatrix } from './testcolormatrix'
import i18next from 'i18next';

@customElement('ui-component-test-app')
export class UIComponentTestApp extends LitElement {
    static styles = unsafeCSS(local_css)
    @state() private currentLocale = 'de-DE';
    // private dataProvider = new ConcreteDataProvider(10, 3)

    uiComponentRef1: Ref<UIComponent> = createRef()
    uiComponentRef2: Ref<UIComponent> = createRef()
    private mode: 'colors' | 'test' = 'test'

    firstUpdated() {
        // Run your script logic here directly on the Shadow/Light DOM
        buildColorMatrix.bind(this)()
        const uiComponent1 = this.uiComponentRef1.value
        if (uiComponent1) configureTestSchemaVirtualScrollLayout(uiComponent1)
        const uiComponent2 = this.uiComponentRef2.value
        if (uiComponent2) configureTestSchema1TypeLayout(uiComponent2)
        // if (uiComponent) configureTestSchema1TypeLayout(uiComponent)
    }

    updated() {

    }

    private handleLocaleChange(e: CustomEvent<{ locale: string }>) {
        const { locale } = e.detail;
        i18next.changeLanguage(locale).then(() => {
            console.log(`i18next language before rerender: ${i18next.language}`, )
            this.applyLocaleToPage(locale);
            this.currentLocale = locale;
        })

    }
    applyLocaleToPage(locale: string): void {
        document.documentElement.lang = locale;
        const primaryLang = locale.split('-')[0].toLowerCase();
        const isRtl = ['ar', 'he', 'fa', 'ur'].includes(primaryLang);
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    }

    render() {
        if (this.mode === "colors") {
            return renderColorMatrix()
        }
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
            <app-locale-selector
                    .selectedLocale="${this.currentLocale}" 
                    .supportedLocales="${['en-US', 'de-DE', 'ar']}"
                    @locale-changed="${this.handleLocaleChange}"
            ></app-locale-selector>
            <p>Active Locale: <strong>${this.currentLocale}</strong></p>
            <p>Active i18N-locale: <strong>${i18next.language}</strong></p>
            <button onclick="gotoRecord(5)">goto record 5</button>
            <div style="display: flex; padding: 5em">
                <ui-component
                        ${ref(this.uiComponentRef1)}
                        id="ui1"
                        current-locale="${this.currentLocale}"
                        style="border: 2px solid cornflowerblue"
                >
                </ui-component>
                <ui-component
                        style="margin-inline-start: 1em"
                        ${ref(this.uiComponentRef2)}
                        current-locale="${this.currentLocale}"
                        id="ui2"
                        style="border: 2px solid cornflowerblue"
                >
                </ui-component>
            </div>
        `
    }
}
