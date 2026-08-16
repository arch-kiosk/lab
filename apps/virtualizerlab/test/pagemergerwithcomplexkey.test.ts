import { test, expect } from "vite-plus/test"
import { DataRecord, MergeWindowItem, PageMerger, type RecordStore as RS } from "../src/pagemerger"
import { DomainKeyHelper } from "../src/sharedtypes"
import { DraftStore } from "../src/draftstore"

export class RecordStore implements RS {
  records?: DataRecord[]
  constructor(values: Array<string>) {
    this.records = values.map((v, index) => {
      return { uid: index.toString(), data: {key: v, data: "data" + v} }
    })
  }

  getRecordsFromDb(from: number, count: number): Promise<DataRecord[]> {
    console.log(`fetching records ${from} to ${from + count - 1}`)
    return Promise.resolve(this.records?.slice(from, from + count) ?? [])
  }
  getDbRecordCount() {
    return this.records?.length ?? 0
  }
}

const domainKeyHelper: DomainKeyHelper<string> = {
  compareKeys(key1, key2) {
    return key1.localeCompare(key2)
  },
  extractKey(record) {
    return record.data.key
  },
}

test("test adding and getting records from the record store", async () => {
  const db = new RecordStore(["A", "B", "C"])
  expect(await db.getRecordsFromDb(0, 1)).toEqual([{ uid: "0", data: {key: "A", data: "dataA"} }])
  expect(await db.getRecordsFromDb(2, 1)).toEqual([{ uid: "2", data: {key: "C", data: "dataC"} }])
  expect(await db.getRecordsFromDb(1, 2)).toEqual([
    { uid: "1", data: {key: "B", data: "dataB"} },
    { uid: "2", data: {key: "C", data: "dataC"} },
  ])
})

const testRecordStore = (recordCount: number) => {
  const records = Array.from({ length: recordCount }, (_v, index) =>
    String.fromCharCode(65 + index),
  )
  return new RecordStore(records)
}

test("merge drafts into window", () => {
  const db = testRecordStore(17)
  const ds = new DraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.unPinDraft(ds.addNew({ uid: "N3", data: {key: "E", data: "dataE" }}))
  ds.unPinDraft(ds.addNew({ uid: "N1", data: {key: "CB", data: "dataCB" } }))
  ds.unPinDraft(ds.addNew({ uid: "N2", data: {key: "BB", data: "dataBB" }}))
  ds.addModification({ uid: "0", data: {key: "BA", data: "dataBA"} }, { uid: "0", data: {key: "A", data: "dataA"} }, domainKeyHelper, false)

  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 0; idx < 5; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: domainKeyHelper.extractKey(db.records![idx]),
      virtualIndex: -1,
      record: db.records![idx],
    })
  }
  pageMerger.mergeDraftsIntoWindow(recordWindow, 0)
  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: 0, key: "A", virtualIndex: -1 },
    { dbIndex: 1, key: "B", virtualIndex: -1 },
    { dbIndex: -1, key: "BA", virtualIndex: -1 },
    { dbIndex: -1, key: "BB", virtualIndex: -1 },
    { dbIndex: 2, key: "C", virtualIndex: -1 },
    { dbIndex: -1, key: "CB", virtualIndex: -1 },
    { dbIndex: 3, key: "D", virtualIndex: -1 },
    { dbIndex: -1, key: "E", virtualIndex: -1 },
    { dbIndex: 4, key: "E", virtualIndex: -1 },
  ])
})

test("move records before window", () => {
  const db = testRecordStore(17)
  const ds = new DraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "0", data: {key: "BA", data: "dataBA"} }, { uid: "0", data: {key: "A", data: "A"} }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: {key: "CA", data: "dataCA"} }, { uid: "5", data: {key: "F", data: "dataF"} }, domainKeyHelper, false)
  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 5; idx < 10; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: domainKeyHelper.extractKey(db.records![idx]),
      virtualIndex: -1,
      record: db.records![idx],
    })
  }

  const removed = pageMerger.moveRecordsBeforeWindow("F", recordWindow)
  expect(removed).toEqual(1)
  expect(recordWindow.map((i) => i.key)).toEqual(["G", "H", "I", "J"])
})

test("getPage 1", async () => {
  const db = testRecordStore(17)
  const ds = new DraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "6", data: {key: "DA", data: "dataDA"} }, { uid: "6", data: {key: "G", data: "G"} }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: {key: "HA", data: "dataHA"} }, { uid: "5", data: {key: "F", data: "dataF"} }, domainKeyHelper, false)
  ds.addModification({ uid: "9", data: {key: "KA", data: "dataKA"} }, { uid: "9", data: {key: "J", data: "dataJ"} }, domainKeyHelper, false)
  let page = await pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    {
      "data": {
        "data": "dataE",
        "key": "E",
      },
      "uid": "4",
    },
    {
      "data": {
        "data": "dataH",
        "key": "H",
      },
      "uid": "7",
    },
    {
      "data": {
        "data": "dataHA",
        "key": "HA",
      },
      "uid": "5",
    },
    {
      "data": {
        "data": "dataI",
        "key": "I",
      },
      "uid": "8",
    },
    {
      "data": {
        "data": "dataK",
        "key": "K",
      },
      "uid": "10",
    },
  ])
  page = await pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: {key: "P", data: "dataP"} },
    { uid: "16", data: {key: "Q", data: "dataQ"} },
  ])
})

