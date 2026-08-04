import {BufferedDataProvider} from "#src/buffereddataprovider";
import delay from "delay"
import {DataRecord} from "#src/sharedtypes";
const MAX_RECORDS = 10000

interface MyDataRecord extends DataRecord {
    textInput: string
    data: any
}

export class ConcreteDataProvider extends BufferedDataProvider {
    private records: Array<MyDataRecord> = Array.from({ length: MAX_RECORDS }, (_v, k) => ({
        uid: crypto.randomUUID() as string,
        textInput: `value ${k}`,
        data: {},
    }))

    protected recalcDbRecordCount(): Promise<boolean> {
        this.cachedDbRecordCount = this.records.length
        return Promise.resolve(true)
    }

    constructor(pageSize = 50, cacheCapacity = 10) {
        super(pageSize, cacheCapacity,
            {
                extractKey: (record:MyDataRecord) => {
                    console.log(`extracting Key for ${record.uid}`, record)
                    return record.textInput
                },
                compareKeys: (key1: string, key2: string) => {
                    return key1.localeCompare(key2)
                }
            })
    }

    public async deleteRecordsFromDb(uids: string[]): Promise<void> {
        this.records = this.records.filter((r) => uids.findIndex((uid) => uid === r.uid) == -1)
        return Promise.resolve()
    }

    protected async fetchRecordsFromDb(fromRecord: number, count: number): Promise<DataRecord[]> {
        await delay(Math.floor(Math.random() * 1201) + 50)
        if (fromRecord < this.records.length && count > 0 && fromRecord + count <= this.records.length) {
            console.log(`loading ${fromRecord} to ${fromRecord + count}`)
            return this.records.slice(fromRecord, fromRecord + count)
        }
        throw Error(
            `it is not possible to fetch ${count} records starting with ${fromRecord} from the data provider`,
        )
    }
}