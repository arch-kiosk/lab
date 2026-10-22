import { LitElement, html, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js';
import '@vaadin/select';
import type { SelectValueChangedEvent } from '@vaadin/select';

@customElement('app-locale-selector')
export class AppLocaleSelector extends LitElement {
    @property({ type: Array }) supportedLocales: string[] = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
    @property({type: String}) selectedLocale: string | null = null;
    @state() private selectItems: { label: string; value: string }[] = [];

    connectedCallback() {
        super.connectedCallback();

        // const saved = localStorage.getItem('user-locale');
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties)
        const browser = navigator.language || 'en-US';
        const target = this.selectedLocale || browser ;

        const primary = target.split('-')[0];
        const initialLocale = this.supportedLocales.find(l => l === target || l.startsWith(primary))
            || this.supportedLocales[0];
        this.updateLocale(initialLocale);
    }

    private updateLocale(locale: string) {
        // if (!locale || locale === this.selectedLocale) return;

        this.selectedLocale = locale;

        // Re-generate dropdown labels localized in the NEW selected language
        const display = new Intl.DisplayNames([locale], { type: 'language' });
        this.selectItems = this.supportedLocales.map(code => ({
            label: `${display.of(code) || code} (${code})`,
            value: code
        }));

        // Notify listeners
        this.dispatchEvent(new CustomEvent('locale-changed', {
            detail: { locale },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
      <vaadin-select
        label="Language"
        .items="${this.selectItems}"
        .value="${this.selectedLocale}"
        @value-changed="${(e: SelectValueChangedEvent) => this.updateLocale(e.detail.value)}"
      ></vaadin-select>
    `;
    }
}