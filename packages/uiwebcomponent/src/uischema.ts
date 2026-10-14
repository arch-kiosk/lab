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

    public processSchemaDefinition() {
        const processSchemaDefinitionElement = (id: string, uiElement: UISchemaUIElements) => {
            const regex = new RegExp('^[a-z][a-z0-9\\-_]*$', 'gmi')
            if (!id.match(regex)) {
                errors.push(
                    `There is an error in the schema definition: the element id "${id}" is illegal. It must start with a letter followed by only letters and numbers. Element skipped.`,
                )
                return
            }
            if (id in this.flatElementList) {
                errors.push(
                    `There is an error in the schema definition: the element id "${id}" is used more than once in the UI schema. Skipped.`,
                )
                return
            }
            if (Object.keys(uiElement).length == 0 || !Object.hasOwn(uiElement, 'element_type')) {
                errors.push(`ui-component: Element id ${id} lacks "element_type": skipped.`)
                return
            }

            if ('binding' in uiElement) {
                const fieldName = uiElement.binding?.field_name.toLowerCase()
                if (fieldName) {
                    if (fieldName in this.bindingToElementList) {
                        console.log(
                            `duplicate binding to ${fieldName} bound again in element ${id} in UI schema`,
                        )
                        errors.push(
                            `There is an error in the schema definition: dsd field "${fieldName}" bound again in element "${id}" in UI schema`,
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
            this.validateSchema()
            console.log(`Processing Schema Definition`, this.uiSchema)
            this.bindingToElementList = {}
            this.flatElementList = {}
            errors = this.checkSchemaDefinitionBasics()
        } catch (e) {
            errors.push(`Cannot validate or process schema definition: ${e as string}`)
            console.error(`Cannot validate or process schema definition`, e)
        }
        if (errors.length === 0) {
            processSchemaDefinitionElement('root', this.uiSchema!.root)
        }
        this.errorMessage = errors.length ? errors.join('\n') + warnings.join('\n') : ''
        return this.errorMessage
    }

    protected validateSchema() {
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
                        return `${path}: must be equal to constant ${expected}`;
                    }
                    case 'enum': {
                        const allowed = (e.params.allowedValues as unknown[])
                            .map((v) => JSON.stringify(v))
                            .join(', ');
                        return `${path}: must be one of [${allowed}]`;
                    }
                    case 'additionalProperties': {
                        return `${path}: unknown property "${e.params.additionalProperty}" is not allowed`;
                    }
                    case 'required': {
                        return `${path}: missing required property "${e.params.missingProperty}"`;
                    }
                    default:
                        return `${path}: ${e.message}`;
                }
            });

            // 3. Deduplicate and throw formatted error list
            const uniqueErrors = Array.from(new Set(formattedMessages));
            throw new UISchemaError(`\n- ${uniqueErrors.join('\n- ')}`);
        }
    }

}