---
#layout: doc

title: Plugin Manager
editLink: true
---

# Type-safe Plugin Manager

## what to import

```typescript
import { createPluginManager, BasePlugin, type PluginManager } from "../src"
import type { BaseEvents } from "../src"
```

## basic usage

Declare the app's events. Make sure to allow for a Promise if the event is of asynchronous nature

```typescript
interface EventCatalog extends BaseEvents {
  boot: (appContext: AppContext) => void | Promise<void>
}
```

Declare the protocol for the context information (AppContext) that is being passed on to event handlers

```typescript
interface AppContext {
  title: string
}
```

Write a plugin that implements handlers for the events
it want's to listen to

```typescript
class TestPlugin extends BasePlugin<AppContext, EventCatalog> {
  hasBooted = false
  lastSeenContextValue = ""

  constructor(name: string) {
    super(name)
  }

  public boot = async (appContext: AppContext): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.hasBooted = true
    this.lastSeenContextValue = appContext.title
  }

  // subscribe to the event during "register"
  register(pluginManager: PluginManager<AppContext, EventCatalog>) {
    super.register(pluginManager)
    this.pluginManager?.listen(this, "boot", this.boot)
  }
}
```

Instantiate the Plugin Manager with the EventCatalog, instantiate and register the plugin

```typescript
const pluginManager = createPluginManager<AppContext, EventCatalog>()
const myPlugin = new TestPlugin("my plugin")
pluginManager.registerPlugin(myPlugin)
```

### 🔫 Fire!

```typescript
await pluginManager.fireTimeSafe("boot", 1000, { title: "my app" })
```

## standard event firing strategies

These standard event strategies are available on the basic pluginmanager. If you want to compile a plugin manager that has a different set of strategies or even custom strategies you must graft them on to the Core Plugin Manager. How to do that is easy to learn from the standard plugin manager: - [PluginManager](/api/type-aliases/PluginManager.md)

### asynchronous fire and forget

Fires the event for all the plugins that are listening to it.  
Times out handlers that take too long

- [fire](/api/functions/fire.md)

### async: call the most recent listener and get a result

calls the listener that was the last to start listening to the event and returns the result value.  
Times out if the handler takes too long.

- [callMostRecent](/api/functions/callMostRecent.md)

### sync: call the most recent listener and get a result

calls the listener that was the last to start listening to the event and returns the result value.  
Expects synchronous listeners.

- [callMostRecentSync](/api/functions/callMostRecentSync.md)
