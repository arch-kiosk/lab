import {DefaultUIElementFactory} from "#src/plugin/defaultuielements/defaultuielements";
import {UIComponentBasePlugin} from "#src/uicomponentbaseplugin";

export default () => ({
    plugins: [
        new DefaultUIElementFactory(),
    ] as Array<UIComponentBasePlugin>
})