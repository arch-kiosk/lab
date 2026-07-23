// oxlint-disable typescript/no-explicit-any
import {type LogEvent } from "pino"
import {KioskLogger, sanitizeLogPayload} from "./kiosklogger"
import Dexie from "dexie";
/**
 * Base class for Kiosk writers. By default this makes sure that all log writers intercept console.log.
 * Override setKioskLogger if you don't want that for a specific log writers.
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
 * KioskConsoleLogWriter: Pipes logs straight back to the browser's original console.
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
 * The interface for the log records in the IndexedDb database
 *
 */
export interface KioskLogRecord {
    id?: number
    level: number
    levelLabel: string
    time: number
    messages: unknown[]
    bindings: Record<string, unknown>
}

/**
 * KioskIndexedDbLogWriter: Saves structured JSON logs directly into IndexedDB via Dexie.
 * By default, this is using "kiosk-logs-db" and the store "logs"
 */
export class KioskIndexedDbLogWriter extends KioskLogWriter {
    private readonly storeName: string
    private db: Dexie

    /**
     * create a KioskLogWriter that writes logs to IndexedDb
     * @param dbName - the name of the IndexedDb database
     * @param storeName _ the name of the store
     */
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