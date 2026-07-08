// oxlint-disable-next-line typescript/no-explicit-any
export type BaseEvents = Record<string, (...args: any[]) => any>

export interface Plugin<AppContext, AppEvents extends BaseEvents> {
  version?: string
  name: string
  handle?: number
  active: boolean
  register(pluginManager: CorePluginManager<AppContext, AppEvents>): void
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
}

/**
 * The core registry engine.
 */
export class CorePluginManager<AppContext, AppEvents extends BaseEvents> {
  readonly #plugins: Array<Plugin<AppContext, AppEvents>> = []
  readonly #listeners = new Map<keyof AppEvents, Array<[Plugin<AppContext, AppEvents>, any]>>()
  #nextHandle = 1

  public registerPlugin(plugin: Plugin<AppContext, AppEvents>) {
    plugin.handle = this.#nextHandle
    plugin.register(this)
    this.#nextHandle += 1
    this.#plugins.push(plugin)
    return plugin.handle
  }

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

  public unregisterPlugin(handle: number) {
    const pluginIndex = this.#plugins.findIndex((p) => p.handle === handle)
    if (pluginIndex !== -1) {
      this.#plugins.splice(pluginIndex, 1)
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

  public getListenersForEvent<Name extends keyof AppEvents>(
    name: Name,
  ): Array<ListenerTuple<AppContext, AppEvents, Name>> {
    return (this.#listeners.get(name) || []) as Array<ListenerTuple<AppContext, AppEvents, Name>>
  }
}
