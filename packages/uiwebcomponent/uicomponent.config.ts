import { DefaultUIElementFactory } from '#src/plugin/defaultuielements/defaultuielements'
import { SchemaUIBasePlugin } from '#src/schemauibaseplugin'

export default () => ({
    plugins: [new DefaultUIElementFactory()] as Array<SchemaUIBasePlugin>,
})
