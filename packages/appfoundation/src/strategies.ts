// strategies.ts
/* oxlint-disable typescript/no-explicit-any */
import { CorePluginManager } from "./corepluginmanager"

/**
 * Strategy: Executes all listeners in parallel, isolating each execution with an individual timeout.
 */
export async function fire<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
  Name extends keyof AppEvents,
>(
  this: CorePluginManager<AppContext, AppEvents>,
  // strictly references the core manager
  eventName: Name,
  timeoutMs: number,
  ...args: Parameters<AppEvents[Name]>
): Promise<void> {
  const listeners = this.getListenersForEvent(eventName)

  const promises = listeners.map(async ([plugin, handler]) => {
    if (!plugin.active) return

    let timeoutId: NodeJS.Timeout | undefined
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Plugin "${plugin.name}" timed out on event "${String(eventName)}".`))
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

/**
 * Strategy: Executes all listeners synchronously
 */
export function fireSync<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
  Name extends keyof AppEvents,
>(
  this: CorePluginManager<AppContext, AppEvents>,
  eventName: Name,
  ...args: Parameters<AppEvents[Name]>
): void {
  const listeners = this.getListenersForEvent(eventName)

  for (const [plugin, handler] of listeners) {
    try {
      handler(...args)
    } catch (e) {
      console.error(`${plugin.name} caused exception on ${eventName as string}: ${e as string}`)
    }
  }
}

/**
 * Strategy: Asynchronously calls the most recently registered active subscriber with a timeout safety net.
 * Used for events defined in AppEvents that return a Promise.
 */
export async function callMostRecent<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
  Name extends keyof AppEvents,
>(
  this: CorePluginManager<AppContext, AppEvents>,
  eventName: Name,
  timeoutMs: number,
  ...args: Parameters<AppEvents[Name]>
): Promise<ReturnType<AppEvents[Name]>> {
  const listeners = this.getListenersForEvent(eventName)
  if (listeners.length === 0) {
    throw new Error(`No active subscribers found for event "${String(eventName)}".`)
  }

  const [plugin, handler] = listeners[listeners.length - 1]

  let timeoutId: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Plugin "${plugin.name}" timed out on event "${String(eventName)}".`))
    }, timeoutMs)
  })

  try {
    const result = await Promise.race([Promise.resolve(handler(...args)), timeoutPromise])
    return result as ReturnType<AppEvents[Name]>
  } catch (e) {
    console.error(`Disabling buggy plugin "${plugin.name}" due to event handling error:`, e)
    plugin.active = false
    throw e
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

/**
 * Strategy: Synchronously calls only the most recently registered active subscriber.
 * Used for events defined in AppEvents that return raw values synchronously.
 */
export function callMostRecentSync<
  AppContext,
  AppEvents extends Record<keyof AppEvents, (...args: any[]) => any>,
  Name extends keyof AppEvents,
>(
  this: CorePluginManager<AppContext, AppEvents>,
  eventName: Name,
  ...args: Parameters<AppEvents[Name]>
): ReturnType<AppEvents[Name]> {
  const listeners = this.getListenersForEvent(eventName)
  if (listeners.length === 0) {
    throw new Error(`No active subscribers found for synchronous event "${String(eventName)}".`)
  }

  const [plugin, handler] = listeners[listeners.length - 1]

  try {
    // Executes perfectly synchronously on the current stack frame
    return handler(...args)
  } catch (e) {
    console.error(`Disabling buggy plugin "${plugin.name}" due to synchronous event error:`, e)
    plugin.active = false
    throw e
  }
}
