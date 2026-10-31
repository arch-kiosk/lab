import { BufferedDataProvider } from '@arch-kiosk/appfoundation/dataprovider'
import { VirtualScrollContainerDataRecord } from '@arch-kiosk/appfoundation/dataprovider'
import {type UIComponentDataProvider} from '#src/uicomponent'
import delay from 'delay'
const MAX_RECORDS = 50

interface MyDataRecord extends VirtualScrollContainerDataRecord {
    text_input: string
    // oxlint-disable-next-line typescript/no-explicit-any
    yesno_field: boolean,
    datetime_field: string,
    date_field: string,
    l1: string
    // data: any
}

export class ConcreteDataProvider extends BufferedDataProvider implements UIComponentDataProvider {

    private getRandomISOString(start = new Date(2000, 0, 1), end = new Date()) {
        const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime())
        return new Date(randomTimestamp).toISOString()
    }

    private records: Array<MyDataRecord> = Array.from({ length: MAX_RECORDS }, (_v, k) => ({
        uid: crypto.randomUUID() as string,
        text_input: `value ${k}`,
        yesno_field: true,
        datetime_field: this.getRandomISOString(),
        date_field: this.getRandomISOString(),
        l1: "2",
        l2: "1",
        l3: "2"
    }))

    protected recalcDbRecordCount(): Promise<boolean> {
        this.cachedDbRecordCount = this.records.length
        return Promise.resolve(true)
    }

    public override dataChanged(recordIndex: number, fieldId: string, value: unknown): void {
        super.dataChanged(recordIndex, fieldId, value)
    }

    protected getSingleExpressionContent(str: string): string | null {
        const match = str.match(/^(?:#|(?<!\\)\${([^}]*)})$/);
        return match ? match[1] ?? "" : null;
    }

    public resolve(valueExpression: unknown | Array<unknown|undefined>, _?: string, recordIndex?: number): unknown {
        let valueExpressions = Array.isArray(valueExpression)?valueExpression:[valueExpression]
        let result: unknown[] = []
        let record: undefined | MyDataRecord = recordIndex === undefined
            ? undefined
            : this.getRecord(recordIndex, true) as MyDataRecord | undefined

        for (const toResolve of valueExpressions) {
                const expression = typeof(toResolve) === "string"
                    ? this.getSingleExpressionContent(toResolve??"")
                    : undefined
                if (!expression) {
                    result.push(toResolve)
                    continue
                }
                if (record) {
                    if (expression in record) {
                        result.push( record[expression])
                        console.log(`resolved ${expression} to type `, typeof(record[expression]))
                        continue
                    } else {
                        console.log(`unknown expression ${expression} in record`, record)
                    }
                }
                result.push( undefined)
        }
        return Array.isArray(valueExpression)?result:result[0]
    }

    constructor(pageSize = 50, cacheCapacity = 10) {
        const domainKeyHelper = {
            extractKey: (record: MyDataRecord) => {
                // console.log(`extracting Key for ${record.uid}`, record)
                return { uid: record.uid, data: record.text_input }
            },
            compareKeys: (
                key1: { uid: string; data: string },
                key2: { uid: string; data: string },
            ) => {
                try {
                    let rc = key1.data.localeCompare(key2.data)
                    return rc ? rc : key1.uid.localeCompare(key2.uid)
                } catch (e) {
                    console.log(e, key1, key2)
                    throw e
                }
            },
        }
        super(pageSize, cacheCapacity, domainKeyHelper)

        // this.records.sort((r1, r2) => domainKeyHelper.compareKeys(r1.textInput, r2.textInput))

        this.records.sort((a, b) =>
            domainKeyHelper.compareKeys(
                domainKeyHelper.extractKey(a),
                domainKeyHelper.extractKey(b),
            ),
        )
    }

    // public getRecord = (index: number, bufferedOnly?: boolean, notify?: ((index: number) => void)) : VirtualScrollContainerDataRecord | undefined => {
    //     return super.getRecord(index, bufferedOnly, notify)
    // }

    public async deleteRecordsFromDb(uids: string[]): Promise<void> {
        this.records = this.records.filter((r) => uids.findIndex((uid) => uid === r.uid) == -1)
        return Promise.resolve()
    }

    protected async fetchRecordsFromDb(
        fromRecord: number,
        count: number,
    ): Promise<VirtualScrollContainerDataRecord[]> {
        await delay(Math.floor(Math.random() * 50) + 10)
        if (
            fromRecord < this.records.length &&
            count > 0 &&
            fromRecord + count <= this.records.length
        ) {
            console.log(`loading ${fromRecord} to ${fromRecord + count}`)
            return this.records.slice(fromRecord, fromRecord + count)
        }
        throw Error(
            `it is not possible to fetch ${count} records starting with ${fromRecord} from the data provider`,
        )
    }
}
