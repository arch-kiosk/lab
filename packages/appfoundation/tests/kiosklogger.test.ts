// oxlint-disable typescript/no-explicit-any
import { vi, test, expect } from 'vite-plus/test'
import { KioskLogger, sanitizeLogPayload } from '../src/kiosklogger'
import { KioskLogWriter } from '../src/kiosklogwriters'
import { type LogEvent } from "pino"

const flushPinoQueue = () => new Promise((resolve) => setTimeout(resolve, 0))

test('sanitizeLogPayload - strips circular references and handles complex objects without crashing', () => {
    const circularObj: any = { name: 'Kiosk' }
    circularObj.self = circularObj

    const result = sanitizeLogPayload([
        'App message',
        circularObj,
        new Error('Runtime crash')
    ])

    expect(result[0]).toBe('App message')
    expect(result[1]).toBe('[KioskLogger: Unserializable Object]')
    expect((result[2] as Record<string, any>).message).toBe('Runtime crash')
})

test('KioskLogger - routes logs dynamically into the custom writer', async () => {
    (process as any).browser = true

    class DummyWriter extends KioskLogWriter {
        public calledWith: unknown[] = []
        async write(log: LogEvent): Promise<void> {
            this.calledWith = log.messages
        }
    }

    const dummyWriter = new DummyWriter()
    const logger = new KioskLogger(dummyWriter, 'info')

    logger.info('user logged in')
    await flushPinoQueue()
    expect(dummyWriter.calledWith).toEqual(['user logged in'])
})

test('KioskLogger - hijack and restore methods proxy global console hooks properly', async () => {
    class DummyWriter extends KioskLogWriter {
        public writeSpy = vi.fn().mockResolvedValue(undefined)
        async write(logEvent: LogEvent): Promise<void> {
            await this.writeSpy(logEvent)
        }
    }

    const dummyWriter = new DummyWriter()
    const logger = new KioskLogger(dummyWriter, 'info')

    try {
        logger.hijackConsole()

        console.error('System validation failure')
        await flushPinoQueue()

        expect(dummyWriter.writeSpy).toHaveBeenCalledTimes(1)
        const loggedEvent = dummyWriter.writeSpy.mock.calls[0][0] as LogEvent
        expect(loggedEvent.level.label).toBe('error')
        expect(loggedEvent.messages).toEqual(['System validation failure'])

        dummyWriter.writeSpy.mockClear()
        logger.restoreConsole()

        console.log('Bypassed log statement')
        await flushPinoQueue()

        expect(dummyWriter.writeSpy).not.toHaveBeenCalled()
    } finally {
        logger.restoreConsole()
    }
})