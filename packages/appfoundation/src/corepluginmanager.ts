// oxlint-disable-next-line typescript/no-explicit-any
export type BaseEvents = Record<string, (...args: any[]) => any>

export interface Plugin<AppContext, AppEvents extends BaseEvents> {
  version?: string
  name: string
  handle?: number
  active: boolean
  register(pluginManager: CorePluginManager<AppContext, AppEvents>): void
  isListeningTo<Name extends keyof AppEvents>(eventName: Name): boolean
  stopListening<Name extends keyof AppEvents>(eventName: Name): void
  listeningStopped?<Name extends keyof AppEvents>(eventName: Name): void
}

export type ListenerTuple<
  AppContext,
  AppEvents extends BaseEvents,
  Name extends keyof AppEvents,
> = [Plugin<AppContext, AppEvents>, AppEvents[Name]]

export abstract class BasePlugin<AppContext, AppEvents extends BaseEvents> implements Plugin<
  AppContext,
  AppEvents
> {
  protected pluginManager?: CorePluginManager<AppContext, AppEvents>
  name: string
  active: boolean
  handle?: number

  register(pluginManager: CorePluginManager<AppContext, AppEvents>) {
    this.pluginManager = pluginManager
  }

  protected constructor(name: string) {
    this.name = name
    this.active = false
  }

  /**
   * stops the plugin from listening to the event
   * @param eventName
   */
  stopListening<Name extends keyof AppEvents>(eventName: Name) {
    this.pluginManager?.removeListener(eventName, this)
  }

  /**
   * checks if this plugin is listening to the specific event
   * @param eventName
   * @returns
   */
  isListeningTo<Name extends keyof AppEvents>(eventName: Name): boolean {
    return Boolean(this.pluginManager?.pluginIsListeningTo(eventName, this))
  }
}

/**
 * The core registry engine.
 */
export class CorePluginManager<AppContext, AppEvents extends BaseEvents> {
  readonly #plugins: Array<Plugin<AppContext, AppEvents>> = []
  // oxlint-disable-next-line typescript/no-explicit-any
  readonly #listeners = new Map<keyof AppEvents, Array<[Plugin<AppContext, AppEvents>, any]>>()
  #nextHandle = 1

  /**
   * registers a plugin
   * This calls the plugin's own register method and assigns it a unique handle
   * It is in register that the plugin can start listening to events
   * @param plugin the plugin instance
   * @returns the plugin's unique handle
   */
  public registerPlugin(plugin: Plugin<AppContext, AppEvents>) {
    plugin.handle = this.#nextHandle
    plugin.register(this)
    this.#nextHandle += 1
    this.#plugins.push(plugin)
    return plugin.handle
  }

  /**
   * makes a plugin listen to a specific event
   * @param plugin
   * @param name
   * @param handler
   */
  public listen<Name extends keyof AppEvents>(
    plugin: Plugin<AppContext, AppEvents>,
    name: Name,
    handler: AppEvents[Name],
  ) {
    if (!this.#listeners.has(name)) {
      this.#listeners.set(name, [])
    }
    this.#listeners.get(name)!.push([plugin, handler])
  }

  /**
   * disconnects a plugin from the plugin manager and removes all listeners.
   * @param {number} handle
   */
  public unregisterPlugin(handle: number) {
    const pluginIndex = this.#plugins.findIndex((p) => p.handle === handle)
    if (pluginIndex === -1) return

    const [plugin] = this.#plugins.splice(pluginIndex, 1)

    for (const eventName of this.#listeners.keys()) {
      this.removeListener(eventName, plugin)
    }
  }

  /**
   * checks if a plugin is listening to a specific event.
   * @param eventName
   * @param pluginToCheck
   * @param includeInactivePlugins - optional. set to true if you want to check inactive plugins, too.
   * @returns true or false
   */
  public pluginIsListeningTo<Name extends keyof AppEvents>(
    eventName: Name,
    pluginToCheck: Plugin<AppContext, AppEvents>,
    includeInactivePlugins = false,
  ): boolean {
    const listeners = this.getListenersForEvent(eventName, includeInactivePlugins)

    return listeners.some(([subscribedPlugin]) => subscribedPlugin === pluginToCheck)
  }

  /**
   * stops the plugin from listening to an event. Calls the listeningStopped method of the plugin if it exists.
   * this is acting on inactive plugins as well.
   * @param eventName
   * @param pluginToStop
   */
  public removeListener<Name extends keyof AppEvents>(
    eventName: Name,
    pluginToStop: Plugin<AppContext, AppEvents>,
  ) {
    const listeners = this.#listeners.get(eventName)
    if (!listeners) return

    const filteredListeners = listeners.filter(
      ([subscribedPlugin]) => subscribedPlugin !== pluginToStop,
    )
    const wasListening = filteredListeners.length < listeners.length
    if (wasListening) {
      this.#listeners.set(eventName, filteredListeners)

      // Notify the plugin if it implements the optional callback
      if (pluginToStop.listeningStopped) {
        pluginToStop.listeningStopped(eventName)
      }
    }
  }

  public activatePlugin(handle: number, active: boolean) {
    const plugin = this.#plugins.find((p) => p.handle === handle)
    if (plugin) {
      plugin.active = active
      return plugin.active
    } else {
      return false
    }
  }

  /**
   * returns the plugins and their listening methods that listen to a certain event
   * @param eventName
   * @param includeInactivePlugins
   * @returns A list of tuples, containing the plugin and the method to call for this event
   */
  public getListenersForEvent<Name extends keyof AppEvents>(
    eventName: Name,
    includeInactivePlugins: boolean = false,
  ): Array<ListenerTuple<AppContext, AppEvents, Name>> {
    const allListeners = this.#listeners.get(eventName)
    if (!allListeners) return []
    if (includeInactivePlugins) {
      return [...allListeners]
    } else {
      return allListeners.filter((l) => l[0].active)
    }
  }
}
