//pluginmanager.ts
/* oxlint-disable typescript/no-explicit-any */
import { CorePluginManager } from "./corepluginmanager"
import { fire, callMostRecentSync, callMostRecent, fireSync } from "./strategies"

export interface StandardFireExtensions<
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
> {
  fireTimeSafe<Name extends keyof AppEvents>(
    name: Name,
    timeoutMs: number,
    ...args: Parameters<AppEvents[Name]>
  ): Promise<void>

  callLastAsynchronously<Name extends keyof AppEvents>(
    name: Name,
    timeoutMs: number,
    ...args: Parameters<AppEvents[Name]>
  ): Promise<ReturnType<AppEvents[Name]>>

  callLastSynchronously<Name extends keyof AppEvents>(
    name: Name,
    ...args: Parameters<AppEvents[Name]>
  ): ReturnType<AppEvents[Name]>

  fireSynchronously<Name extends keyof AppEvents>(
    name: Name,
    ...args: Parameters<AppEvents[Name]>
  ): void
}

/**
 * The standard, full-featured platform manager variant for everyday use.
 */
export type PluginManager<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
> = CorePluginManager<AppContext, AppEvents> & StandardFireExtensions<AppEvents>

/**
 * THE EVERYDAY GRAFTER FACTORY
 * Automatically instantiates a Core registry and welds the standard strategies onto it.
 */
export function createPluginManager<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
>(): PluginManager<AppContext, AppEvents> {
  const manager = new CorePluginManager<AppContext, AppEvents>()

  const extendedManager = manager as unknown as PluginManager<AppContext, AppEvents>

  // Weld the standalone execution strategy from strategies.ts onto the core manager instance
  extendedManager.fireTimeSafe = fire

  extendedManager.fireSynchronously = fireSync

  extendedManager.callLastAsynchronously = callMostRecent

  extendedManager.callLastSynchronously = callMostRecentSync

  return extendedManager
}
