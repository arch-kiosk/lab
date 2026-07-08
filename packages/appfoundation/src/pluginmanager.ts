import { CorePluginManager } from "./corepluginmanager"
import type { BaseEvents } from "./corepluginmanager"
import { fireWithTimeouts } from "./strategies"

export interface StandardFireExtensions<AppEvents extends BaseEvents> {
  fireTimeSafe<Name extends keyof AppEvents>(
    name: Name,
    timeoutMs: number,
    ...args: Parameters<AppEvents[Name]>
  ): Promise<void>
}

/**
 * The standard, full-featured platform manager variant for everyday use.
 */
export type PluginManager<AppContext, AppEvents extends BaseEvents> = CorePluginManager<
  AppContext,
  AppEvents
> &
  StandardFireExtensions<AppEvents>

/**
 * THE EVERYDAY GRAFTER FACTORY
 * Automatically instantiates a Core registry and welds the standard strategies onto it.
 */
export function createPluginManager<AppContext, AppEvents extends BaseEvents>(): PluginManager<
  AppContext,
  AppEvents
> {
  const manager = new CorePluginManager<AppContext, AppEvents>()

  const extendedManager = manager as unknown as PluginManager<AppContext, AppEvents>

  // Weld the standalone execution strategy from strategies.ts onto the core manager instance
  extendedManager.fireTimeSafe = fireWithTimeouts

  return extendedManager
}
