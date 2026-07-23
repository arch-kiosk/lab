---
#layout: doc

title: KioskLogger
editLink: true
---

# KioskLogger: Central Logging Class

## what to import

```typescript
import {KioskConsoleLogWriter, KioskIndexedDbLogWriter, KioskLogger} from "@arch-kiosk/appfoundation"
```

## basic usage
The KioskLogger is instantiated once by the outer app framework. It intercepts the console.xyz methods and routes them to the internal log methods. So you can simply use your normal console.log, warn, info etc.
  
You can also pass the KioskLogger instance on and use its methods log, warn, err...
On instantiation of the KioskLogger you decide what level of logs gets passed on and how the log lines are written out. You achieve the latter with a specific KioskLogWriter class of your choice. 

An example should make it crystal clear: 
```typescript
import {KioskIndexedDbLogWriter, KioskLogger} from "@arch-kiosk/appfoundation"

function installKioskLogger() {
    // writes to the IndexedDb "K67-logs" into the store "logs"
    void new KioskLogger(new KioskIndexedDbLogWriter("K67-logs", "logs"))
    // This would simply log to the console:
    // void new KioskLogger(new KioskConsoleLogWriter())
}```

