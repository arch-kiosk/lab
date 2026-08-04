import {customElement} from "lit/decorators.js";
import {html, LitElement, PropertyValues, unsafeCSS} from "lit";
import local_css from "./styles/lab-app.sass?inline"
import {createRef, Ref, ref} from 'lit/directives/ref.js';
import {VirtualScrollLayout} from "./tanstack-virtualizer-lab"
import "./tanstack-virtualizer-lab"
import {ConcreteDataProvider} from "#src/teststaticdataprovider"

@customElement("lab-app")
export class LabApp extends LitElement {
    static styles = unsafeCSS(local_css)
    virtualLayoutRef: Ref<VirtualScrollLayout> = createRef();
    virtualLayoutRef2: Ref<VirtualScrollLayout> = createRef();
    private dataProvider = new ConcreteDataProvider(10, 3)
    private dataProvider2 = new ConcreteDataProvider()


    renderVirtualLayout () {
        return html`
            <virtualizer-lab ${ref(this.virtualLayoutRef)} id="virtualizerLayout" rowheight="64"></virtualizer-lab>
        `
    }

    renderVirtualLayout2 () {
        return html`
            <virtualizer-lab ${ref(this.virtualLayoutRef2)} id="virtualizerLayout2" rowheight="36"></virtualizer-lab>
        `
    }

    addRow(layoutNr: number) {
        if (layoutNr === 0) {
            this.dataProvider.addRecord({
                uid: crypto.randomUUID(),
                textInput: `added value`,
                data: {},
            })
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        const virtualLayout = this.virtualLayoutRef.value
        const virtualLayout2 = this.virtualLayoutRef2.value
        if (virtualLayout) {
            this.dataProvider.setNotifier((notification) => {
                console.log(this.dataProvider.getTelemetry())
                virtualLayout.notifyDataReady(notification)
            })
            virtualLayout.init(this.dataProvider, this.renderRow.bind(this))
        }
        if (virtualLayout2) {
            this.dataProvider2.setNotifier((notification) => virtualLayout2.notifyDataReady(notification))
            virtualLayout2.init(this.dataProvider2, this.renderRow.bind(this))
        }
    }

    removeRecord(layoutNr: number, _event: Event, uid:string) {
        if (uid && layoutNr == 1) {
            void this.dataProvider.deleteRecords([uid])
        }
    }

    // oxlint-disable-next-line typescript/no-explicit-any
    renderRow(_rowNr: number, _: string, record: Record<string, any>) {
        return html`
            <div class="row-style" part="row">
                <div><input id="textInput" type="text" value="${record.textInput}"/></div>
                <button @click="${(event: Event) => this.removeRecord(1, event, record.uid)}">delete row</button>
            </div>`
    }

    render() {
        return html`
            <div class="outer-form">
                <div style="min-height: 5em;background-color: papayawhip">1 record form </div>
                <button @click="${() => this.addRow(0)}">add row</button>
                <div style="height: 35vh;border: 2px solid darkred">
                    ${this.renderVirtualLayout()}
                </div>
            </div>
            <div style="height: 2em"></div>
            <button @click="${() => this.addRow(1)}">add row</button>
            <div style="height: 25vh;border: 2px solid green">
                ${this.renderVirtualLayout2()}
            </div>
        `
    }
}
