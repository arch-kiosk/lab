//index.ts
export { createPluginManager } from "./pluginmanager"
export type { PluginManager } from "./pluginmanager"
export { BasePlugin, CorePluginManager } from "./corepluginmanager"
export type { Plugin } from "./corepluginmanager"
export {KioskLogger} from "./kiosklogger"
export {KioskConsoleLogWriter, KioskIndexedDbLogWriter} from "./kiosklogwriters"
export * from "./strategies"
