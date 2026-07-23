import pino, { type Logger, type Level, type LogEvent } from 'pino'
import { KioskLogWriter } from './kiosklogwriters'

interface ConsoleBackup {
    log: typeof console.log
    info: typeof console.info
    warn: typeof console.warn
    error: typeof console.error
    debug: typeof console.debug
}
const ORIGINAL_CONSOLE: ConsoleBackup = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console)
}

/**
 * Gemini: Sanitizes an array of raw log arguments into pure JSON-safe primitives or structural clones.
 *          Prevents DataCloneError exceptions in storage engines caused by DOM nodes, functions, or circular structures.
 *
 */
export function sanitizeLogPayload(args: unknown[]): unknown[] {
    return args.map(arg => {
        if (arg === null || arg === undefined) return String(arg)
        if (typeof arg !== 'object' && typeof arg !== 'function') return arg

        if (arg instanceof Error) {
            return { name: arg.name, message: arg.message, stack: arg.stack }
        }

        try {
            return JSON.parse(JSON.stringify(arg))
        } catch {
            return '[KioskLogger: Unserializable Object]'
        }
    })
}

/**
 * Central Kiosk Logger class that routes logs to pino.
 * This needs a KioskLogWriter instance which consumes the logs and outputs them.
 * The KioskLogWriter also decides if the console gets hijacked.
 * However, it is KioskLogger that allows you to restore the original console.
 */
export class KioskLogger {
    private writer: KioskLogWriter
    private readonly pino: Logger
    public readonly originalConsole = ORIGINAL_CONSOLE

    /**
     * Creates a KioskLogger instance
     * @param writer - An instance of a KioskLogWriter subclass
     * @param logLevel - the severity of loglines that get logged. Logs with levels below this one get swallowed.
     */
    constructor(writer: KioskLogWriter, logLevel: Level = 'info') {
        this.writer = writer

        this.pino = pino({
            level: logLevel,
            browser: {
                asObject: true, //a bit redundant as "write" is set.
                write: () => {
                }, // Prevents recursive loops
                transmit: {
                    level: logLevel,
                    // Explicitly matching Pino's native callback signature
                    send: (_level: Level, logEvent: LogEvent) => {
                        this.writer.write(logEvent).catch((err) => {
                            ORIGINAL_CONSOLE.error("KioskLogger: Pipeline write failure:", err)
                        })
                    }
                }
            }
        })
        this.writer.setKioskLogger(this)
    }

    /**
     * Reroutes console.log/info/warn etc. to the according methods of this
     */
    hijackConsole(): ConsoleBackup {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        console.log =this.info.bind(this)
        console.info = this.info.bind(this)
        console.warn = this.warn.bind(this)
        console.error = this.error.bind(this)
        console.debug = this.debug.bind(this)
        /* eslint-enable @typescript-eslint/no-explicit-any */
        return this.originalConsole
    }

    /**
     * Restores browser's native logging behavior
     */
    restoreConsole(): void {
        console.log = this.originalConsole.log.bind(console)
        console.info = this.originalConsole.info.bind(console)
        console.warn = this.originalConsole.warn.bind(console)
        console.error = this.originalConsole.error.bind(console)
        console.debug = this.originalConsole.debug.bind(console)
    }

    /**
     * works like console.log
     * @param args
     */
    log(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.info(...args)
    }
    /**
     * works like console.info
     * @param args
     */
    info(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.info(...args)
    }
    /**
     * works like console.error
     * @param args
     */
    error(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.error(...args)
    }
    /**
     * works like console.warn
     * @param args
     */
    warn(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.warn(...args)
    }
    /**
     * works like console.debug
     * @param args
     */
    debug(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.debug(...args)
    }

}