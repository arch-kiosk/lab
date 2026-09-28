import { UIComponent, UISchema } from '#src/uicomponent'
import { ConcreteDataProvider } from './teststaticdataprovider'
import {
    DataProviderValidationResult,
    ValidationResultsReturnType,
} from '@arch-kiosk/virtualizerlab'

export function configureTestSchemaVirtualScrollLayout(uiComponent: UIComponent) {
    uiComponent.uiSchema = getUiSchema()
    const dataProvider = getDataProvider()
    uiComponent.dataProvider = dataProvider
    dataProvider.onValidateField = (_, fieldId, value) => {
        const rc: Array<DataProviderValidationResult> = []
        if (fieldId === "text_input") {
            if (!value || value as string === "") {
                rc.push({result: 'error', msg: "Please enter a value for this field"})
            }
        }
        return [rc, undefined] as ValidationResultsReturnType<typeof value>
    }
    dataProvider.onValidateRecord = (recordIndex, _record) => {
        const rc : Array<DataProviderValidationResult> = []

        if (_record["text_input"] === "asdf") {
            rc.push({ result: 'error', msg: 'This record is not valid!' })
        }
        return [rc, undefined] as ValidationResultsReturnType<typeof _record>
    }
}

function getDataProvider() {
    return new ConcreteDataProvider(10, 50)
    // dataProvider.setNotifier((notification) => {
    //   // console.log(this.dataProvider.getTelemetry())
    //   // virtualLayout.notifyDataReady(notification)
    // })
    // // virtualLayout.init(this.dataProvider, this.renderRow.bind(this))
}

function getUiSchema(): UISchema {
    return {
        header: {
            version: '2',
        },
        meta: {
            scenario: 'query input',
        },
        dsd: {},
        data_binding: {
            cardinality: 'N',
        },
        root: {
            element_type: 'layout',
            orchestration_strategy: 'scroll',
            layout: {
                max_height: '50vh',
                padding: '.5rem',

            },
            ui_elements: {
                row_layout: {
                    element_type: 'layout',
                    orchestration_strategy: 'columns',
                    layout: {
                        padding: '.5em',
                        max_height: 'calc(3.5rem * 1.2)'
                    },
                    ui_elements: {
                        uid: {
                            element_type: 'text_field',
                            value: '${uid}',
                            text: 'uid',
                            visible: '${text_input}'
                        },
                        text_input: {
                            element_type: 'text_field',
                            value: '${text_input}',
                            text: 'text',
                        },
                    },
                },
            },
        },
    }
}
