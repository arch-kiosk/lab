import pino, { type Logger, type Level, type LogEvent } from 'pino'
import { KioskLogWriter } from './kiosklogwriters'

export interface ConsoleBackup {
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
 * Sanitizes an array of raw log arguments into pure JSON-safe primitives or structural clones.
 * Prevents DataCloneError exceptions in storage engines caused by DOM nodes, functions, or circular structures.
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
 * KioskLogger class
 *
 */
export class KioskLogger {
    private writer: KioskLogWriter
    private readonly pino: Logger
    public readonly originalConsole = ORIGINAL_CONSOLE

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
     * Replace the global console object methods with our Pino wrapper
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

    log(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.info(...args)
    }
    info(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.info(...args)
    }
    error(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.error(...args)
    }
    warn(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.warn(...args)
    }
    debug(...args: unknown[]) {
        // @ts-expect-error: Pino overloads prevent spreading generic any[]
        this.pino.debug(...args)
    }

    // /**
    //  * Internal parser to transform raw console arguments for Pino compatibility
    //  */
    // // oxlint-disable-next-line typescript/no-explicit-any
    // private _route(level: string, args: any[]) {
    //     // try {
    //         const logMethod = {
    //             "info": this.pino.info.bind(this.pino),
    //             "log": this.pino.info.bind(this.pino),
    //             "error": this.pino.error.bind(this.pino),
    //             "warn": this.pino.warn.bind(this.pino),
    //             "debug": this.pino.debug.bind(this.pino),
    //         }[level]
    //         if (typeof logMethod !== 'function') return;
    //
    //         const cleanStrings = args.map(arg => {
    //             if (typeof arg !== 'object' || arg === null) return String(arg);
    //             try {
    //                 return JSON.stringify(arg);
    //             } catch {
    //                 return '[KioskLogger: Unserializable Object]';
    //             }
    //         });
    //         logMethod(cleanStrings.join(' '));
    //
    //     // } catch (e) {
    //     //     ORIGINAL_CONSOLE.error('[KioskLogger] Hard failure in routing pipeline', e);
    //     // }
    // }
}