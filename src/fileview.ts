import {LitElement} from 'lit-element';

// @ts-ignore
import local_css from './styles/component-file-view.sass?inline';
import {nothing, PropertyValues, unsafeCSS} from "lit";
import {html} from "lit";
import {property, state, customElement} from "lit/decorators.js";
import {UIComponentFileFetchParams} from "./uischema";

@customElement('file-view')
export class FileView extends (LitElement) {
    static styles = unsafeCSS(local_css);

    private observer?: IntersectionObserver = undefined

    constructor() {
        super();
        this.observerCallback = this.observerCallback.bind(this);
    }

    @state()
    private visible = false

    @state()
    private loadError = false

    @property()
    uuid_file: string = ""

    @property()
    resolution: string = ""

    @property()
    description: string = ""

    @property()
    fitContent: string = "contain"

    @property()
    url: string = ""

    // get visible() {
    //     return (this._visible)
    // }
    //
    // set visible(value: boolean) {
    //     if (value !== this._visible) {
    //         this._visible = value
    //         this.load_image()
    //     }
    // }

    connectedCallback() {
        super.connectedCallback();
        // Remove the wrapping `<lazy-image>` element from the a11y tree.
        this.setAttribute('role', 'presentation');
        // if IntersectionObserver is available, initialize it.
        this.initIntersectionObserver();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.disconnectObserver();
    }

    /**
     * Sets the `intersecting` property when the element is on screen.
     * @param  {[IntersectionObserverEntry]} entries
     * @protected
     */
    observerCallback(entries: IntersectionObserverEntry[]) {
        // @ts-ignore
        const isIntersecting = ({isIntersecting}) => isIntersecting;
        if (entries.some(isIntersecting)) {
            this.disconnectObserver()
            this.visible = true;
        }
    }

    /**
     * Initializes the IntersectionObserver when the element instantiates.
     * @protected
     */
    initIntersectionObserver() {
        // if IntersectionObserver is unavailable, simply load the image.
        if (!('IntersectionObserver' in window)) return this.visible = true;
        // Short-circuit if observer has already initialized.
        // Short-circuit if observer has already initialized.
        if (this.observer) return;
        // Start loading the image 10px before it appears on screen
        const rootMargin = '10px';
        this.observer =
            new IntersectionObserver(this.observerCallback, {rootMargin});
        this.observer.observe(this);
        return;
    }

    /**
     * Disconnects and unloads the IntersectionObserver.
     * @protected
     */
    disconnectObserver() {
        this.observer?.disconnect();
        delete this.observer;
        this.observer = undefined;
    }

    protected clicked() {
        const ds = this.dataset
        this.dispatchEvent(new CustomEvent("select-image",
            {
                bubbles: true,
                composed: true,
                detail: {
                    uuid: this.uuid_file,
                    width: ds.width ?? "0",
                    height: ds.height ?? "0"
                }
            }));
    }

    protected willUpdate(_changedProperties: PropertyValues) {
        super.willUpdate(_changedProperties);
        if (_changedProperties.has("uuid_file") || _changedProperties.has("resolution"))
            this.url = ""
        if (!this.url && !this.loadError) this.load_image()
    }

    protected firstUpdated() {

    }

    public reportURL(url: string | null | unknown) {
        if (typeof url === 'string' && url) {
            console.log(`GOT URL: ${url} `)
            this.url = url
        } else {
            this.url = ''
            this.loadError = true
        }
    }

    fetch_image() {
        this.url = ""

        const detail: UIComponentFileFetchParams = {
            uuid: this.uuid_file,
            resolution: this.resolution,
            reportURL: this.reportURL.bind(this)
        };

        const event = new CustomEvent('fetchfile',
            {detail, bubbles: false, composed: true, cancelable: false});
        this.dispatchEvent(event);
    }


    load_image() {
        if (this.resolution && this.uuid_file) {
            if (this.visible) {
                this.fetch_image()
            }
        }
    }

    renderImage() {
        let cssStyle: string = ""
        switch (this.fitContent) {
            case "fit":
                cssStyle = "object-fit: scale-down;max-width:100%"
                break
            case "scale":
                cssStyle = "height: 100%;width:100%"
                break
            default:
                cssStyle = "object-fit: contain"
        }

        return this.visible ? html`
            <img style="${cssStyle}"
                 @click="${this.clicked}" src="${this.url}"
                 alt="${this.description}"/>` : nothing
    }

    renderPlaceholder() {
        return this.visible ? html`
            <div class="placeholder"><i class="fa fa-hourglass"></i></div>` : nothing
    }

    renderLoadError() {
        return this.visible
            ? html`
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
                    </div>`
            : nothing
    }

    render() {
        return html`
            ${this.url
                    ? this.renderImage()
                    : (this.loadError
                            ? this.renderLoadError()
                            : this.renderPlaceholder())
            }`
    }
}
