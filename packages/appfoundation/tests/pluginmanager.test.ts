import { expect, test } from "vite-plus/test"
import { createPluginManager, BasePlugin, type PluginManager } from "../src"
import type { BaseEvents } from "../src"
// import {TimeSafeHookLooper} from "../src/pluginmanager.ts";

test("init plugin manager", () => {
  const plugin = createPluginManager<{ app: string }, {}>()
  expect(plugin, "init plugin manager").toBeDefined()
})

test("init plugin manager with hook catalog", async () => {
  interface AppContext {
    title: string
  }

  interface HookCatalog extends BaseEvents {
    boot: (appContext: AppContext) => void | Promise<void>
  }

  // const hookCatalog: HookCatalog = {
  //   boot: () => {}
  // }

  class TestPlugin extends BasePlugin<AppContext, HookCatalog> {
    hasBooted = false
    lastSeenContextValue = ""

    constructor(name: string) {
      super(name)
    }

    register(pluginManager: PluginManager<AppContext, HookCatalog>) {
      super.register(pluginManager)
      this.pluginManager?.listen(this, "boot", this.boot)
    }

    public boot = async (appContext: AppContext): Promise<void> => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      this.hasBooted = true
      this.lastSeenContextValue = appContext.title
    }
  }

  const testPlugin = new TestPlugin("test plugin")
  const pluginManager = createPluginManager<AppContext, HookCatalog>()
  expect(pluginManager, "init plugin manager").toBeDefined()
  pluginManager.registerPlugin(testPlugin)
  expect(testPlugin.handle, "init plugin got handle").toBe(1)
  //--- Scenario 1: Inactive plugin should NOT boot
  expect(testPlugin.active).toBe(false)

  await pluginManager.fireTimeSafe("boot", 1000, { title: "Test App" })

  expect(testPlugin.hasBooted).toBe(false)

  // --- Scenario 2: Active plugin SHOULD boot ---
  expect(pluginManager.activatePlugin(1, true), "activate plugin").toBe(true)
  await pluginManager.fireTimeSafe("boot", 1000, { title: "Test App" })
  expect(testPlugin.hasBooted).toBe(true)
  expect(testPlugin.lastSeenContextValue).toBe("Test App")
})
