// oxlint-disable typescript/no-explicit-any
import {type LogEvent } from "pino"
import {KioskLogger, sanitizeLogPayload} from "./kiosklogger"
import Dexie from "dexie";
/**
 * Base class for Kiosk writers.
 */
export abstract class KioskLogWriter
{
    protected kioskLogger?: KioskLogger

    setKioskLogger(kioskLogger: KioskLogger) {
        this.kioskLogger = kioskLogger
        if (kioskLogger) {
            kioskLogger.hijackConsole()
        }
    }

    abstract write(logEvent: LogEvent): Promise<void>
}

/**
 * Writer 1: Pipes logs straight back to the browser's original console.
 */
export class KioskConsoleLogWriter extends KioskLogWriter {


    async write(logEvent: LogEvent): Promise<void> {
        if (!this.kioskLogger) return

        const { messages, bindings, level } = logEvent
        const originalConsole = this.kioskLogger.originalConsole

        // Match the log label to the right console channel directly via lookup map
        const logFn = {
            fatal: originalConsole.error,
            error: originalConsole.error,
            warn: originalConsole.warn,
            info: originalConsole.info,
            debug: originalConsole.debug,
            trace: originalConsole.debug
        }[level.label] || originalConsole.log

        const prefix = `[${level.label.toUpperCase()}]`

        const outputArgs: any[] = [prefix]

        if (messages && messages.length > 0) {
            outputArgs.push(...messages)
        }

        if (bindings && bindings.length > 0) {
            const flatBindings = Object.assign({}, ...bindings)
            if (Object.keys(flatBindings).length > 0) {
                outputArgs.push(flatBindings)
            }
        }

        logFn(...outputArgs)
    }
}
/**
 * Writer 2: Saves structured JSON logs directly into IndexedDB.
 */

interface KioskLogRecord {
    id?: number
    level: number
    levelLabel: string
    time: number
    messages: unknown[]
    bindings: Record<string, unknown>
}

/**
 * Writer 2: Saves structured JSON logs directly into IndexedDB via Dexie.
 */
export class KioskIndexedDbLogWriter extends KioskLogWriter {
    private readonly storeName: string
    private db: Dexie

    constructor(dbName = 'kiosk-logs-db', storeName = 'logs') {
        super()
        this.storeName = storeName
        this.db = new Dexie(dbName)

        this.db.version(1).stores({
            [this.storeName]: '++id, time'
        })
    }

    async write(logEvent: LogEvent): Promise<void> {
        // Flatten the child hierarchy array into a single key-value object for storage
        const flatBindings = logEvent.bindings && logEvent.bindings.length > 0
            ? Object.assign({}, ...logEvent.bindings)
            : {};

        await this.db.table<KioskLogRecord, number>(this.storeName).add({
            level: logEvent.level.value,
            levelLabel: logEvent.level.label,
            time: logEvent.ts,
            // Sanitize exclusively for this writer to protect the database layer
            messages: sanitizeLogPayload(logEvent.messages),
            bindings: flatBindings
        })
    }
}