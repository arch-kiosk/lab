import {createPluginManager, type PluginManager} from "@arch-kiosk/appfoundation"
import configFunction from '../uicomponent.config'
import {type EventCatalog, type AppContext} from "#src/apptypes";

let bootPromise: Promise<PluginManager<AppContext, EventCatalog>> | null = null;

export default async () : Promise<PluginManager<AppContext, EventCatalog>> => {
    if (bootPromise) return bootPromise;

    bootPromise = (async () => {
        const pluginManager = createPluginManager<AppContext, EventCatalog>()
        const config = configFunction()
        for (const plugin of config.plugins) {
            pluginManager.registerPlugin(plugin)
        }

        await pluginManager.fireTimeSafe("boot", 1000, {})
        return pluginManager

    })()
    return bootPromise
}