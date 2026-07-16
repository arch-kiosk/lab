import {UIConfigurableElementFactory} from "#src/uielementfactory";

export type AppContext = {
    [key: string]: unknown;
};

export interface EventCatalog {
    boot: (appContext: AppContext) => void | Promise<void>
    registerUIElements: (factory: UIConfigurableElementFactory) => void
}
