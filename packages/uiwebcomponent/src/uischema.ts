// // 1. Export legacy versions as namespaced objects
// export * as UISchemaV1 from './UISchema1';
import Ajv from 'ajv';
import schemaArtifact from './jsonschema/uischemav2.json'
import { UIElementWithId } from '#src/sharedtypes'

import {
    UISchemaError,
    UISchemaLayoutElement,
    UISchema,
    UISchemaUIElements,
    Dictionary,
} from '#src/uischema2'
import { UIComponent } from '#src/uicomponent'


export * from './uischema2'

export class UISchemaProcessor {
    private uiSchema: UISchema
    private ajv = new Ajv({
        allErrors: true,
        discriminator: true, // Enables strict tagged-union evaluation on @discriminator fields (Gemini thinks).
    })
    private validateFn = this.ajv.compile(schemaArtifact);
    bindingToElementList: Dictionary<UIElementWithId> = {}
    flatElementList: Dictionary<UISchemaUIElements> = {}
    errorMessage = ""

    constructor(uiSchema: UISchema) {
        this.uiSchema = uiSchema
    }
    protected checkSchemaDefinitionBasics(): Array<string> {
        const errors: Array<string> = []
        if (!this.uiSchema!.data_binding?.cardinality) {
            errors.push(`The schema definition is not defining data_binding.cardinality. `)
        }
        if (!this.uiSchema?.root) {
            console.log(`No root element`)
            errors.push(`There is an error in the schema definition: There is no root element`)
        } else {
            if (this.uiSchema.root.element_type !== 'layout') {
                console.log(`the root element must be of type layout.`)
                errors.push(
                    `There is an error in the schema definition: the root element must have element_type "layout"`,
                )
            } else {
                if (!this.uiSchema.root.orchestration_strategy) {
                    console.error(
                        'The schema definition is not defining an orchestration_strategy',
                        this.uiSchema.root,
                    )
                    errors.push(`The schema definition is not defining an orchestration_strategy`)
                }
                if (!this.uiSchema.root.ui_elements) {
                    errors.push(
                        `The schema definition is not defining any ui_elements in the root layout`,
                    )
                }
            }
        }
        return errors
    }

    public processSchemaDefinition(uicomponent: UIComponent) {
        const processSchemaDefinitionElement = (id: string, uiElement: UISchemaUIElements) => {
            const regex = new RegExp('^[a-z][a-z0-9\\-_]*$', 'gmi')
            if (!id.match(regex)) {
                errors.push(
                    uicomponent.i18NST("uic.schema-error-illegal-element-id", `There is an error in the schema definition: the element id {{id}} is illegal. 
                    It must start with a letter followed by only letters and numbers. Element skipped.`, [id]),
                )
                return
            }
            if (id in this.flatElementList) {
                errors.push(
                    uicomponent.i18NST("uic.schema-error-element-id-redundant",
                        `There is an error in the schema definition: the element id {{id}} is used more than once in the UI schema. Skipped.`, [id])
                )
                return
            }
            if (Object.keys(uiElement).length == 0 || !Object.hasOwn(uiElement, 'element_type')) {
                errors.push(uicomponent.i18NST("uic.schema-error-no-element-type", 'ui-component: Element id {{id}} lacks "element_type": skipped.', [id]))
                return
            }

            if ('binding' in uiElement) {
                const fieldName = uiElement.binding?.field_name.toLowerCase()
                if (fieldName) {
                    if (fieldName in this.bindingToElementList) {
                        console.log(
                            `duplicate binding to ${fieldName} bound again in element ${id} in UI schema`,
                        )
                        errors.push(uicomponent.i18NST("uic.schema-error-redundant-dsd-binding",
                            `There is an error in the schema definition: dsd field {{fieldName}} bound again in element {{id}} in UI schema`, [fieldName, id])
                        )
                        return
                    }
                    this.bindingToElementList[fieldName] = { id: id, element: uiElement }
                }
            }
            this.flatElementList[id] = uiElement
            if (uiElement.element_type === 'layout') {
                for (const [id, childElement] of Object.entries(
                    (uiElement as UISchemaLayoutElement).ui_elements,
                )) {
                    processSchemaDefinitionElement(id, childElement)
                }
            }
        }

        /* main function body */
        let errors: Array<unknown> = []
        let warnings: Array<string> = []
        try {
            console.log(`Validating Schema Definition`)
            this.validateSchema(uicomponent)
            console.log(`Processing Schema Definition`, this.uiSchema)
            this.bindingToElementList = {}
            this.flatElementList = {}
            errors = this.checkSchemaDefinitionBasics()
        } catch (e) {
            errors.push(uicomponent.i18NST("uic.schema-error-unspecific",`Cannot validate or process schema definition: {{e}}`, [e as string]))
            console.error(`Cannot validate or process schema definition`, e)
        }
        if (errors.length === 0) {
            processSchemaDefinitionElement('root', this.uiSchema!.root)
        }
        this.errorMessage = errors.length ? errors.join('\n') + warnings.join('\n') : ''
        return this.errorMessage
    }

    protected validateSchema(uicomponent: UIComponent) {
        /* generated by Gemini */
        const valid = this.validateFn(this.uiSchema);
        if (!valid) {
            const rawErrors = this.validateFn.errors || [];

            // 1. Filter out internal structural noise from conditional (if/then/allOf) schemas
            const targetErrors = rawErrors.filter(
                (e) => !['if', 'then', 'else', 'allOf', 'anyOf', 'oneOf'].includes(e.keyword)
            );

            // 2. Map AJV errors into detailed, contextual strings
            const formattedMessages = targetErrors.map((e) => {
                const path = e.instancePath || '/root';

                switch (e.keyword) {
                    case 'const': {
                        const expected = JSON.stringify(e.params.allowedValue);
                        return uicomponent.i18NST("uic.schema-error-must-equal", '{{path}}: must be equal to constant {{expected}}',[path, expected])
                    }
                    case 'enum': {
                        const allowed = (e.params.allowedValues as unknown[])
                            .map((v) => JSON.stringify(v))
                            .join(', ');
                        return uicomponent.i18NST("uic.schema-error-must-one-of", '{{path}}: must be one of [{{allowed}}]', [path, allowed]);
                    }
                    case 'additionalProperties': {
                        return uicomponent.i18NST("uic.schema-error-unknown-property",'{{path}} unknown property "{{property}}" is not allowed', [path, e.params.additionalProperty]);
                    }
                    case 'required': {
                        return uicomponent.i18NST("uic.schema-error-property-required",'{{path}} missing required property {{property}}', [path, e.params.missingProperty]);
                    }
                    default:
                        return uicomponent.i18NST("uic.schema-error-unspecific",`error in {{path}}: {{message}}`,[path, e.message ?? '']);
                }
            });

            // 3. Deduplicate and throw formatted error list
            const uniqueErrors = Array.from(new Set(formattedMessages));
            throw new UISchemaError(`\n- ${uniqueErrors.join('\n- ')}`);
        }
    }

}