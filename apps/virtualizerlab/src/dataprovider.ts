// oxlint-disable typescript/no-explicit-any
import delay from "delay";

const MAX_RECORDS = 1000

export class DataProvider {
    async recordCount(): Promise<number> {
        await delay(1000)
        return MAX_RECORDS
    }

    // oxlint-disable-next-line typescript/no-explicit-any
    async fetch(fromRecord: number, toRecord: number) : Promise<Record<string, any>[]> {
        await delay(Math.floor(Math.random() * 1201) + 50)
        if (fromRecord <= MAX_RECORDS && toRecord >= fromRecord && toRecord <= MAX_RECORDS) {
            console.log(`loading ${fromRecord} to ${toRecord}`)
            const recs: Array<Record<string, any>> = Array.from({length: toRecord - fromRecord})
            recs.forEach((_rec, idx) => {
                recs[recs.length - idx - 1] = {"id": `REC${fromRecord+idx}`, "data": {}}
            })

            return recs
        } else throw Error(`it is not possible to fetch records ${fromRecord} to ${toRecord} from the data provider`)
    }
}