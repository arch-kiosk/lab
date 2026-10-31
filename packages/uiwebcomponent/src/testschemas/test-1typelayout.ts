import { UIComponent, UISchema } from '#src/uicomponent'
import i18next from 'i18next';
import { ConcreteDataProvider } from './teststaticdataprovider'
import enTranslation from '#src/locales/en/translation.json'
import arTranslation from '#src/locales/ar/translation.json'
import deTranslation from '#src/locales/de/translation.json'

import {
    DataProviderValidationResult,
    ValidationResultsReturnType,
} from '@arch-kiosk/appfoundation/dataprovider'
import { _ } from 'ajv'
import {
    LookupListParams,
    UIComponentLookupProvider,
    UIElementLookupListItem,
} from '#src/sharedtypes'

class Type1DataProvider extends ConcreteDataProvider {
    resolve(valueExpression: unknown | Array<unknown | undefined>, _?: string, recordIndex?: number): unknown {
        const expressions: unknown[] = Array.isArray(valueExpression)
            ? valueExpression
            : [valueExpression]
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

    public override dataChanged(recordIndex: number, fieldId: string, value: unknown): void {
        super.dataChanged(recordIndex, fieldId, value)
    }
}

export function configureTestSchema1TypeLayout(uiComponent: UIComponent) {
    uiComponent.uiSchema = getUiSchema()
    uiComponent.lookupProvider = getLookupProvider()
    const dataProvider = getDataProvider()
    uiComponent.dataProvider = dataProvider
    uiComponent.interpretedExpressionPrefix = '#'
    i18next.init({lng: 'de-DE', debug: true,
        resources: {
            en: {
                translation: enTranslation
            },
            ar: {
                translation: arTranslation
            },
            de: {
                translation: deTranslation
            }
        }})

    uiComponent.i18NTProvider = (key: string, options: Record<string, unknown>): string => {
        console.log(`rerender translating ${key} to language ${i18next.language}`)
        return i18next.t(key, options)
    }
    setTimeout(() => dataProvider.getRecord(0, false, (index) => {
        dataProvider.setActiveRecord(index)
        uiComponent.requestUpdate()
    }), 500)

    dataProvider.onValidateField = (_, fieldId, value) => {
        const rc: Array<DataProviderValidationResult> = []
        console.log(`dataProvider.onValidate ${fieldId} with value ${value}`)
        if (fieldId === 'text_input') {
            if (!value || value as string === '') {
                rc.push({ result: 'error', msg: 'Please enter a value for this field' })
            }
        }
        if (fieldId === 'yesno_field' && value) {
            rc.push({ result: 'error', msg: 'Please enter a value for this field' })
        }
        if (fieldId === 'date_field' && value) {
            rc.push({ result: 'error', msg: 'Please enter a value for this field' })
        }
        if (fieldId === 'datetime_field' && value) {
            rc.push({ result: 'error', msg: 'Please enter a value for this field' })
        }

        if (fieldId === 'l1' && value === "ac") {
            rc.push({ result: 'error', msg: "Please don't select 'ac' for this field" })
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

function getLookupProvider(): UIComponentLookupProvider {
    const lookupLists: Record<string, Record<string, string>> = {
        "selection topic 1": {
            "1": "topic 1 - 1",
            "2": "topic 2 - 2",
        },
        "selection topic 2": {
            "1": "topic 2 - 1",
            "2": "topic 2 - 2",
        }
    }

    return {

        getLookupList(topic: string, _params: LookupListParams): Array<UIElementLookupListItem>  {
            const rc = Object.entries(lookupLists[topic]).map((item) => {
                return {
                    value: item[0],
                    label: item[1]
                }
            })
            console.log("looking up topic", topic, rc)
            return rc
        },
        lookup(topic: string, value: string) {
            return lookupLists[topic][value]
        }
    }
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
            order: ['uid', 'line_1', '...','text_input', 'line_1','sub_layout'],
            ui_level: 2,
            layout: {
                max_height: '50vh',
            },
            ui_elements: {
                "uid": {
                    binding: {
                        field_name: 'uid',
                    },
                    element_type: 'text_field',
                    value: '${uid}',
                    text: 'uid',
                    visible: '${text_input}',
                },
                "list1": {
                    binding: {
                        field_name: 'l1',
                    },
                    element_type: 'drop-down-selection',
                    text: 'list-1',
                    visible: '${l1}',
                    readonly: false,
                    // items: [["ac", "Architecture"], ["dp", "Deposit"], ["bu", "Burial"]]
                    items: {
                        topic: "selection topic 1"
                    }
                },
                "list2": {
                    binding: {
                        field_name: 'l2',
                    },
                    element_type: 'combo-box',
                    text: 'dynamic list',
                    visible: '${l2}',
                    readonly: false,
                    items: {
                        topic: "selection topic 1"
                    }
                },
                "list3": {
                    binding: {
                        field_name: 'l3',
                    },
                    element_type: 'combo-box',
                    text: 'dynamic list 2',
                    visible: '${l3}',
                    readonly: false,
                    items: {
                        topic: "selection topic 2"
                    }
                },
                "text_label_2": {
                    layout: {
                        max_width: '',
                        min_width: 'max',
                        max_height: '',
                        min_height: '',
                    },
                    element_type: 'template_label',
                    value: '${text_input}',
                    display_identifier: true,
                    text: 'text_label',
                },
                "date_time_field_1": {
                    binding: {
                      field_name: "datetime_field"
                    },
                    layout: {
                        max_width: '',
                        min_width: 'max',
                        max_height: '',
                        min_height: '',
                    },
                    element_type: 'date_time_field',
                    enabled: true,
                    readonly: false,
                    date_format: "latin",
                    include_time: true,
                    value: '${datetime_field}',
                    text: 'date and time',
                },
                "date_field_1": {
                    binding: {
                      field_name: "date_field"
                    },
                    element_type: 'date_time_field',
                    enabled: true,
                    readonly: false,
                    include_time: false,
                    value: '${date_field}',
                    text: 'date',
                },
                "button_1": {
                    element_type: 'button',
                    button_type: 'iconButton',
                    icon: ''
                },
                "line_1": {
                    layout: {
                        min_width: "max"
                    },
                    element_type: 'line',
                    transparent: false,
                    is_template: true
                },
                text_input: {
                    binding: {
                        field_name: 'text_field',
                    },
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
                },
                sub_layout: {
                    element_type: 'layout',
                    orchestration_strategy: 'columns',
                    ui_level: 3,
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
                        'bool1': {
                            binding: {
                                field_name: 'yesno_field',
                            },
                            readonly: false,
                            element_type: 'bool',
                            value: "${yesno_field}",
                            text: 'yes no',
                        },
                    },

                },
            },
        },
    }
}
