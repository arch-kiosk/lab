import {BasePlugin} from "@arch-kiosk/appfoundation";
import {AppContext, EventCatalog} from "./apptypes";
import type {PluginManager} from "@arch-kiosk/appfoundation";

export abstract class UIComponentBasePlugin extends BasePlugin<AppContext, EventCatalog>{
    hasBooted = false

    abstract boot: (appContext: AppContext) => Promise<void>

    constructor(name?: string) {
        super(name ? name : new.target.name);
    }

    register(pluginManager: PluginManager<AppContext, EventCatalog>) {
        console.log(`registering plugin ${this.name}`)
        super.register(pluginManager)
        this.pluginManager?.listen(this, "boot", this.boot)
        console.log(`plugin Manager: `, pluginManager)
    }

}