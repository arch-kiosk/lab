import { UIComponent, UISchema } from '#src/uicomponent'
import { ConcreteDataProvider } from './teststaticdataprovider'
import {
    DataProviderValidationResult,
    ValidationResultsReturnType,
} from '@arch-kiosk/appfoundation/dataprovider'
import { _ } from 'ajv'

class Type1DataProvider extends ConcreteDataProvider {
    resolve(valueExpression: unknown | Array<unknown | undefined>, _?: string, recordIndex?: number): unknown {
        const expressions: unknown[] = Array.isArray(valueExpression) ? valueExpression : [valueExpression]
        expressions.forEach((exp, idx) => {
            let result: unknown |undefined
            if (typeof(exp) === "string") {
                if (exp?.startsWith('#')) {
                    if (exp === '#calc()') {
                        result = 'calc(1em - 10px)'
                    } else if (exp === '#getSomeClass()') {
                        result = 'some-class'
                    }
                } else {
                    if (exp === 'some_lua_expression(asdf)') {
                        result = false
                    }
                }
            }
            if (result !== undefined) {
                if (Array.isArray(valueExpression) ) {
                    valueExpression[idx] = result
                } else {
                    valueExpression = result
                }
            }
        })
        return super.resolve(valueExpression, _, recordIndex)
    }
}

export function configureTestSchema1TypeLayout(uiComponent: UIComponent) {
    uiComponent.uiSchema = getUiSchema()
    const dataProvider = getDataProvider()
    uiComponent.dataProvider = dataProvider
    uiComponent.interpretedExpressionPrefix = '#'

    setTimeout(() => dataProvider.getRecord(0, false, (index) => {
        dataProvider.setActiveRecord(index)
        uiComponent.requestUpdate()
    }), 500)

    dataProvider.onValidateField = (_, fieldId, value) => {
        const rc: Array<DataProviderValidationResult> = []
        if (fieldId === 'text_input') {
            if (!value || value as string === '') {
                rc.push({ result: 'error', msg: 'Please enter a value for this field' })
            }
        }
        return [rc, undefined] as ValidationResultsReturnType<typeof value>
    }
    dataProvider.onValidateRecord = (recordIndex, _record) => {
        const rc: Array<DataProviderValidationResult> = []

        if (_record['text_input'] === 'asdf') {
            rc.push({ result: 'error', msg: 'This record is not valid!' })
        }
        return [rc, undefined] as ValidationResultsReturnType<typeof _record>
    }
}

function getDataProvider() {
    return new Type1DataProvider(10, 50)
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
            cardinality: '1',
        },
        root: {
            element_type: 'layout',
            orchestration_strategy: 'columns',
            order: ['uid', 'text_input', 'sub_layout'],
            ui_level: 2,
            layout: {
                max_height: '50vh',
            },
            ui_elements: {
                uid: {
                    binding: {
                        field_name: 'uid',
                    },
                    element_type: 'text_field',
                    value: '${uid}',
                    text: 'uid',
                    visible: '${text_input}',
                },
                text_input: {
                    style: {
                      css_styles: {
                          "--ui-col-bg-1-input": "yellow",
                          "--ui-col-primary-bg-1": "contrast-color(var(--ui-col-bg-1-input))"
                      }
                    },
                    layout: {
                        max_width: '',
                        min_width: 'max',
                        max_height: '',
                        min_height: '',
                    },
                    element_type: 'text_field',
                    value: '${text_input}',
                    text: 'text',
                    multiline: true,
                    // style: {
                    //     css_classes: ['my-class', '#getSomeClass()'],
                    //     css_styles: {
                    //         "text-align": "center",
                    //         "background-color": "var(--col-bg-1)",
                    //         "border-radius": "calc(1rem - 10px)"}
                    // },
                    binding: {
                        field_name: 'text_field',
                    },
                },
                sub_layout: {
                    element_type: 'layout',
                    // visible: "some_lua_expression(asdf)",
                    orchestration_strategy: 'columns',
                    ui_level: 0,
                    layout: {
                        min_width: "max"
                    },
                    style: {
                        'css_styles': {
                            // 'background-color': 'lightpink',
                            'padding': "1em"
                        },
                    },
                    ui_elements: {
                        'text1': {
                            binding: {
                                field_name: 'text1',
                            },
                            element_type: 'text_field',
                            text: 'text1 field',
                        },
                    },

                },
            },
        },
    }
}
