import { expect, test } from "vite-plus/test"
import { createPluginManager, BasePlugin, type PluginManager } from "../src"
import type { BaseEvents } from "../src"
// import {TimeSafeHookLooper} from "../src/pluginmanager.ts";

test("init plugin manager", () => {
  const plugin = createPluginManager<{ app: string }, {}>()
  expect(plugin, "init plugin manager").toBeDefined()
})

test("init plugin manager with hook catalog", async () => {
  /* ---------
   set up
   ----------- */
  interface AppContext {
    title: string
  }

  interface HookCatalog extends BaseEvents {
    boot: (appContext: AppContext) => void | Promise<void>
  }

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

  /* ---------
   test
   ----------- */

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

test("PluginManager - callLastAsynchronous and callLastSynchronous local isolated execution", async () => {
  /* ---------
     set up
     ----------- */

  interface AppContext {
    env: "development" | "production" | "test"
    apiEndpoint: string
  }

  interface FeatureCatalog extends BaseEvents {
    calculateAsyncConfig: (key: string) => Promise<string>
    formatSyncLabel: (input: string) => string
  }

  // Explicitly type our local wrapper manager type for clean plugin registration signatures
  type LocalPluginManager = PluginManager<AppContext, FeatureCatalog>

  class AsyncConfigPluginA extends BasePlugin<AppContext, FeatureCatalog> {
    constructor() {
      super("Async-Config-A")
    }

    // Swapped 'any' for the precise local manager type token
    register(pm: LocalPluginManager) {
      super.register(pm)
      this.pluginManager?.listen(this, "calculateAsyncConfig", async (key) => `pluginA-${key}`)
    }
  }

  class AsyncConfigPluginB extends BasePlugin<AppContext, FeatureCatalog> {
    constructor() {
      super("Async-Config-B")
    }

    register(pm: LocalPluginManager) {
      super.register(pm)
      this.pluginManager?.listen(this, "calculateAsyncConfig", async (key) => {
        if (key === "hang-me") {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        return `pluginB-${key}`
      })
    }
  }

  class SyncFormatPlugin extends BasePlugin<AppContext, FeatureCatalog> {
    constructor() {
      super("Sync-Formatter")
    }

    register(pm: LocalPluginManager) {
      super.register(pm)
      this.pluginManager?.listen(this, "formatSyncLabel", (input) => input.toUpperCase())
    }
  }

  /* ---------
   test
   ----------- */

  const manager = createPluginManager<AppContext, FeatureCatalog>()

  const pluginA = new AsyncConfigPluginA()
  const pluginB = new AsyncConfigPluginB()
  const syncPlugin = new SyncFormatPlugin()

  const handleA = manager.registerPlugin(pluginA)
  const handleB = manager.registerPlugin(pluginB)
  const handleSync = manager.registerPlugin(syncPlugin)

  manager.activatePlugin(handleA, true)
  manager.activatePlugin(handleB, true)
  manager.activatePlugin(handleSync, true)

  const resultNormal = await manager.callLastAsynchronous(
    "calculateAsyncConfig",
    500,
    "oauth-token",
  )
  expect(resultNormal).toBe("pluginB-oauth-token")

  await expect(
    manager.callLastAsynchronous("calculateAsyncConfig", 100, "hang-me"),
  ).rejects.toThrow(/timed out/)

  expect(pluginB.active).toBe(false)

  const resultFallback = await manager.callLastAsynchronous(
    "calculateAsyncConfig",
    500,
    "oauth-token",
  )
  expect(resultFallback).toBe("pluginA-oauth-token")

  const syncResult = manager.callLastSynchronous("formatSyncLabel", "standalone-test")
  expect(syncResult).toBe("STANDALONE-TEST")
})
