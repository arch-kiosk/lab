import { CorePluginManager } from "./corepluginmanager"
import type { BaseEvents } from "./corepluginmanager"

/**
 * Strategy: Executes all listeners in parallel, isolating each execution with an individual timeout.
 */
export async function fireWithTimeouts<
  AppContext,
  AppEvents extends BaseEvents,
  Name extends keyof AppEvents,
>(
  this: CorePluginManager<AppContext, AppEvents>,
  // strictly references the core manager
  name: Name,
  timeoutMs: number,
  ...args: Parameters<AppEvents[Name]>
): Promise<void> {
  const listeners = this.getListenersForEvent(name)

  const promises = listeners.map(async ([plugin, handler]) => {
    if (!plugin.active) return

    let timeoutId: NodeJS.Timeout | undefined
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Plugin "${plugin.name}" timed out on event "${String(name)}".`))
      }, timeoutMs)
    })
    try {
      await Promise.race([Promise.resolve(handler(...args)), timeoutPromise])
    } catch (e) {
      console.error(`Disabling buggy plugin "${plugin.name}" due to event handling error:`, e)
      plugin.active = false
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
    }
  })
  await Promise.all(promises)
}
