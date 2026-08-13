import { test, expect } from "vite-plus/test"
import {
  DataRecord,
  MergeWindowItem,
  PageMerger,
  RecordStore,
  SimpleDraftStore,
} from "./pagemerger"
import { DomainKeyHelper } from "../src/sharedtypes"

const domainKeyHelper: DomainKeyHelper<string> = {
  compareKeys(key1, key2) {
    return key1.localeCompare(key2)
  },
  extractKey(record) {
    return record.data
  },
}

test("test adding and getting records from the record store", () => {
  const db = new RecordStore(["A", "B", "C"])
  expect(db.getRecordsFromDb(0, 1)).toEqual([{ uid: "0", data: "A" }])
  expect(db.getRecordsFromDb(2, 1)).toEqual([{ uid: "2", data: "C" }])
  expect(db.getRecordsFromDb(1, 2)).toEqual([
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
  ])
})

test("test adding and getting a modification from the draft store", () => {
  const ds = new SimpleDraftStore()
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  expect(ds.getRecord("0")).toEqual({ uid: "0", data: "BA" })
  ds.addModification({ uid: "1", data: "ZA" }, { uid: "1", data: "B" }, domainKeyHelper, false)
  expect(ds.getDraftsInsertedBeforeRecord({ uid: "2", data: "CA" }, domainKeyHelper)).toEqual([
    { uid: "0", data: "BA" },
  ])
  expect(ds.getModifiedRecordsBeforeRecord({ uid: "2", data: "CA" }, domainKeyHelper)).toEqual([
    { uid: "0", data: "BA" },
    { uid: "1", data: "ZA" },
  ])
})

const testRecordStore = (recordCount: number) => {
  const records = Array.from({ length: recordCount }, (_v, index) =>
    String.fromCharCode(65 + index),
  )
  return new RecordStore(records)
}

test("PageMerger init", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  const page = pageMerger.getPage(0)
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
  ])
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
})

test("virtual index test", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  expect(pageMerger.getVirtualIndex(1, { uid: "1", data: "B" })).toBe(1)
  expect(pageMerger.getVirtualIndex(2, { uid: "2", data: "C" })).toBe(2)
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  expect(pageMerger.getVirtualIndex(1, { uid: "1", data: "B" })).toBe(0)
  expect(pageMerger.getVirtualIndex(2, { uid: "2", data: "C" })).toBe(2)
})

test("merge drafts into window", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.unPinDraft(ds.addNew({ uid: "N3", data: "E" }))
  ds.unPinDraft(ds.addNew({ uid: "N1", data: "CB" }))
  ds.unPinDraft(ds.addNew({ uid: "N2", data: "BB" }))
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 0; idx < 5; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: db.records![idx].data,
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
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: "CA" }, { uid: "5", data: "F" }, domainKeyHelper, false)
  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 5; idx < 10; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: db.records![idx].data,
      virtualIndex: -1,
      record: db.records![idx],
    })
  }

  const removed = pageMerger.moveRecordsBeforeWindow("F", recordWindow)
  expect(removed).toEqual(1)
  expect(recordWindow.map((i) => i.key)).toEqual(["G", "H", "I", "J"])
})

test("move records behind window", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "0", data: "BA" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: "GA" }, { uid: "5", data: "F" }, domainKeyHelper, false)
  ds.addModification({ uid: "9", data: "MA" }, { uid: "9", data: "J" }, domainKeyHelper, false)
  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 5; idx < 10; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: db.records![idx].data,
      virtualIndex: -1,
      record: db.records![idx],
    })
  }

  const removed = pageMerger.moveRecordsBehindWindow("J", recordWindow)
  expect(removed).toEqual(1)
  expect(recordWindow.map((i) => i.key)).toEqual(["F", "G", "H", "I"])
})

test("merge drafts into window and shuffle", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.unPinDraft(ds.addNew({ uid: "N3", data: "E" }))
  ds.unPinDraft(ds.addNew({ uid: "N1", data: "CB" }))
  ds.unPinDraft(ds.addNew({ uid: "N2", data: "BB" }))
  ds.addModification({ uid: "1", data: "BA" }, { uid: "1", data: "B" }, domainKeyHelper, false)
  ds.addModification({ uid: "0", data: "CA" }, { uid: "0", data: "A" }, domainKeyHelper, false)

  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 0; idx < 5; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: db.records![idx].data,
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
    { dbIndex: -1, key: "CA", virtualIndex: -1 },
    { dbIndex: -1, key: "CB", virtualIndex: -1 },
    { dbIndex: 3, key: "D", virtualIndex: -1 },
    { dbIndex: -1, key: "E", virtualIndex: -1 },
    { dbIndex: 4, key: "E", virtualIndex: -1 },
  ])

  let removed = pageMerger.moveRecordsBeforeWindow("A", recordWindow)
  expect(removed).toEqual(0)

  removed = pageMerger.moveRecordsBehindWindow("E", recordWindow)
  expect(removed).toEqual(0)

  pageMerger.removeShuffledRecords(recordWindow)
  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: -1, key: "BA", virtualIndex: -1 },
    { dbIndex: -1, key: "BB", virtualIndex: -1 },
    { dbIndex: 2, key: "C", virtualIndex: -1 },
    { dbIndex: -1, key: "CA", virtualIndex: -1 },
    { dbIndex: -1, key: "CB", virtualIndex: -1 },
    { dbIndex: 3, key: "D", virtualIndex: -1 },
    { dbIndex: -1, key: "E", virtualIndex: -1 },
    { dbIndex: 4, key: "E", virtualIndex: -1 },
  ])
})

test("move, reshuffle and virtualize", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "6", data: "DA" }, { uid: "6", data: "G" }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: "HA" }, { uid: "5", data: "F" }, domainKeyHelper, false)
  ds.addModification({ uid: "9", data: "KA" }, { uid: "9", data: "J" }, domainKeyHelper, false)
  const recordWindow: Array<MergeWindowItem> = []
  for (let idx = 5; idx <= 9; idx++) {
    recordWindow.push({
      dbIndex: idx,
      key: db.records![idx].data,
      virtualIndex: -1,
      record: db.records![idx],
    })
  }
  pageMerger.mergeDraftsIntoWindow(recordWindow, 1)

  let removed = pageMerger.moveRecordsBeforeWindow("F", recordWindow)
  expect(removed).toEqual(1)

  removed = pageMerger.moveRecordsBehindWindow("J", recordWindow)
  expect(removed).toEqual(1)

  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: 5, key: "F", virtualIndex: -1 },
    { dbIndex: 7, key: "H", virtualIndex: -1 },
    { dbIndex: -1, key: "HA", virtualIndex: -1 },
    { dbIndex: 8, key: "I", virtualIndex: -1 },
  ])

  pageMerger.removeShuffledRecords(recordWindow)

  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: 7, key: "H", virtualIndex: -1 },
    { dbIndex: -1, key: "HA", virtualIndex: -1 },
    { dbIndex: 8, key: "I", virtualIndex: -1 },
  ])
  pageMerger.assignVirtualIndexes(recordWindow)

  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: 7, key: "H", virtualIndex: 6 },
    { dbIndex: -1, key: "HA", virtualIndex: -1 },
    { dbIndex: 8, key: "I", virtualIndex: 8 },
  ])
  pageMerger.completeVirtualIndexes(recordWindow, 1)

  expect(
    recordWindow.map((i) => {
      return { dbIndex: i.dbIndex, key: i.key, virtualIndex: i.virtualIndex }
    }),
  ).toEqual([
    { dbIndex: 7, key: "H", virtualIndex: 6 },
    { dbIndex: -1, key: "HA", virtualIndex: 7 },
    { dbIndex: 8, key: "I", virtualIndex: 8 },
  ])

  expect(pageMerger.pageComplete(recordWindow, 1)).toBe(false)
  let finishedRecordWindow: Array<MergeWindowItem> = [
    { dbIndex: 4, virtualIndex: 5, key: "E", record: { uid: "5", data: "E" } },
    ...recordWindow,
    { dbIndex: 10, virtualIndex: 9, key: "K", record: { uid: "10", data: "K" } },
  ]
  expect(pageMerger.pageComplete(finishedRecordWindow, 1)).toBe(true)
  expect(pageMerger.compilePage(finishedRecordWindow, 1)).toEqual([
    { data: "E", uid: "5" },
    { data: "H", uid: "7" },
    { data: "HA", uid: "5" },
    { data: "I", uid: "8" },
    { data: "K", uid: "10" },
  ])
})

test("recalc windows boundaries", () => {
  const db = testRecordStore(17)
  const tests = [
    { origin: { uid: "5", data: "F" }, target: { uid: "5", data: "G" }, expected: [0, 0] }, // IN -> IN
    { origin: { uid: "5", data: "F" }, target: { uid: "5", data: "E" }, expected: [-1, 0] }, // IN -> BEFORE
    { origin: { uid: "5", data: "F" }, target: { uid: "5", data: "K" }, expected: [0, 1] }, // IN -> AFTER
    { origin: { uid: "0", data: "A" }, target: { uid: "0", data: "CA" }, expected: [0, 0] }, // BEFORE -> BEFORE
    { origin: { uid: "0", data: "A" }, target: { uid: "0", data: "GA" }, expected: [1, 0] }, // BEFORE -> IN
    { origin: { uid: "0", data: "A" }, target: { uid: "0", data: "L" }, expected: [1, 1] }, // BEFORE -> AFTER
    { origin: { uid: "0", data: "L" }, target: { uid: "0", data: "A" }, expected: [-1, -1] }, // AFTER -> BEFORE
    { origin: { uid: "0", data: "L" }, target: { uid: "0", data: "GA" }, expected: [0, -1] }, // AFTER -> IN
    { origin: { uid: "0", data: "L" }, target: { uid: "0", data: "K" }, expected: [0, 0] }, // AFTER -> AFTER
  ]

  for (const test of tests) {
    const ds = new SimpleDraftStore()
    const pageMerger = new PageMerger(db, ds, domainKeyHelper)
    ds.addModification(test.target, test.origin, domainKeyHelper, false)
    let recordWindow = pageMerger.initRecordWindow(db.getRecordsFromDb(5, 5), 5)
    expect(
      pageMerger.recalcWindowBoundaries(recordWindow),
      `${test.origin.data} -> ${test.target.data}`,
    ).toEqual(test.expected)
  }
})

test("getPage 1", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "6", data: "DA" }, { uid: "6", data: "G" }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: "HA" }, { uid: "5", data: "F" }, domainKeyHelper, false)
  ds.addModification({ uid: "9", data: "KA" }, { uid: "9", data: "J" }, domainKeyHelper, false)
  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "4", data: "E" },
    { uid: "7", data: "H" },
    { uid: "5", data: "HA" },
    { uid: "8", data: "I" },
    { uid: "10", data: "K" },
  ])
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "6", data: "DA" },
  ])
  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "9", data: "KA" },
    { uid: "11", data: "L" },
    { uid: "12", data: "M" },
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
  ])
  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "P" },
    { uid: "16", data: "Q" },
  ])
})

test("getPage 2", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "6", data: "DA" }, { uid: "6", data: "G" }, domainKeyHelper, false)
  ds.addModification({ uid: "5", data: "HA" }, { uid: "5", data: "F" }, domainKeyHelper, false)
  ds.addModification({ uid: "9", data: "KA" }, { uid: "9", data: "J" }, domainKeyHelper, false)
  ds.addModification({ uid: "16", data: "A" }, { uid: "16", data: "Q" }, domainKeyHelper, false)
  ds.addModification({ uid: "0", data: "R" }, { uid: "0", data: "A" }, domainKeyHelper, false)
  let page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "P" },
    { uid: "0", data: "R" },
  ])
})

test("getPage records at page seams", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  ds.addModification({ uid: "16", data: "0" }, { uid: "16", data: "Q" }, domainKeyHelper, false)

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "4", data: "E" },
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
  ])
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "16", data: "0" },
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
  ])
  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "14", data: "O" },
    { uid: "15", data: "P" },
  ])
})

test("getPage move record between pages", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  ds.addModification({ uid: "1", data: "JA" }, { uid: "1", data: "B" }, domainKeyHelper, false)

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
    { uid: "1", data: "JA" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
    { uid: "5", data: "F" },
  ])
})

test("getPage move whole page between next page plus 1", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  for (let idx = 0; idx < 5; idx++) {
    const r = db.records![idx]
    ds.addModification(
      { uid: r.uid, data: "K" + r.data },
      { uid: r.uid, data: r.data },
      domainKeyHelper, false
    )
  }

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "10", data: "K" },
    { uid: "0", data: "KA" },
    { uid: "1", data: "KB" },
    { uid: "2", data: "KC" },
    { uid: "3", data: "KD" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
  ])
})

test("getPage move whole page between next page", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  for (let idx = 0; idx < 5; idx++) {
    const r = db.records![idx]
    ds.addModification(
      { uid: r.uid, data: "I" + r.data },
      { uid: r.uid, data: r.data },
      domainKeyHelper, false
    )
  }

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "1", data: "IB" },
    { uid: "2", data: "IC" },
    { uid: "3", data: "ID" },
    { uid: "4", data: "IE" },
    { uid: "9", data: "J" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "0", data: "IA" },
  ])
})

test("getPage move whole page between two pages", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  for (let idx = 0; idx < 5; idx++) {
    const r = db.records![idx]
    ds.addModification(
      { uid: r.uid, data: "J" + r.data },
      { uid: r.uid, data: r.data },
      domainKeyHelper,false
    )
  }

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "JA" },
    { uid: "1", data: "JB" },
    { uid: "2", data: "JC" },
    { uid: "3", data: "JD" },
    { uid: "4", data: "JE" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
  ])
})

test("getPage move last 5 records between two pages", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  for (let idx = 12; idx < 17; idx++) {
    const r = db.records![idx]
    ds.addModification(
      { uid: r.uid, data: "J" + r.data },
      { uid: r.uid, data: r.data },
      domainKeyHelper,false
    )
  }

  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "10", data: "K" },
    { uid: "11", data: "L" },
  ])

  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "12", data: "JM" },
    { uid: "13", data: "JN" },
    { uid: "14", data: "JO" },
    { uid: "15", data: "JP" },
    { uid: "16", data: "JQ" },
  ])

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
  ])
})

test("getPage move last short page records between two pages", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  for (let idx = 15; idx < 17; idx++) {
    const r = db.records![idx]
    ds.addModification(
      { uid: r.uid, data: "J" + r.data },
      { uid: r.uid, data: r.data },
      domainKeyHelper,false
    )
  }

  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
  ])

  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "JP" },
    { uid: "16", data: "JQ" },
    { uid: "10", data: "K" },
    { uid: "11", data: "L" },
    { uid: "12", data: "M" },
  ])

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
  ])
})

test("getPage short and empty pages", () => {
  let db = testRecordStore(3)
  let ds = new SimpleDraftStore()
  let pageMerger = new PageMerger(db, ds, domainKeyHelper)
  let page: Array<DataRecord> | undefined

  ds.unPinDraft(ds.addNew({ uid: "X", data: "0" }))

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X", data: "0" },
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
  ])

  db = testRecordStore(0)
  ds = new SimpleDraftStore()
  pageMerger = new PageMerger(db, ds, domainKeyHelper)
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([])

  ds.unPinDraft(ds.addNew({ uid: "X", data: "0" }))

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([{ uid: "X", data: "0" }])

})

test("getPage with only drafts in last page", ()=> {
  const db = testRecordStore(5)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.unPinDraft(ds.addNew({ uid: "X", data: "F" }))
  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([{ uid: "X", data: "F" }])
})

test("getPage with a whole page of drafts at the end", ()=> {
  const db = testRecordStore(5)
  const ds = new SimpleDraftStore()
  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  for (let i = 0; i<6; i++) ds.unPinDraft(ds.addNew({ uid: `X${i}`, data: "ZZ" + String.fromCharCode(65 + i),
  }))

  let page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X5", data: "ZZF" },
  ])

  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
      { uid: "X0", data: "ZZA" },
      { uid: "X1", data: "ZZB" },
      { uid: "X2", data: "ZZC" },
      { uid: "X3", data: "ZZD" },
      { uid: "X4", data: "ZZE" },
  ])
})


test("getPage with repeatedly modified record and draft", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addModification({ uid: "11", data: "BA" }, db.records![11], pageMerger.domainKeyHelper)

  let page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "10", data: "K" },
    { uid: "11", data: "BA" },
    { uid: "12", data: "M" },
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
  ])
  ds.unpinAll()

  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "9", data: "J" },
    { uid: "10", data: "K" },
    { uid: "12", data: "M" },
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
  ])
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "11", data: "BA" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
  ])
  ds.addModification({ uid: "11", data: "Trallala" }, db.records![11], pageMerger.domainKeyHelper)
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "11", data: "Trallala" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
  ])
  ds.unpinAll()
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
  ])
  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "10", data: "K" },
    { uid: "12", data: "M" },
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
    { uid: "15", data: "P" },
  ])
  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "16", data: "Q" },
    { uid: "11", data: "Trallala" },
  ])
})

test("getPage with new drafts on last page and one db record inserted", () => {
  const db = testRecordStore(3)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  for (let i = 0; i<5; i++) {
    ds.unPinDraft(ds.addNew(
        {
          uid: `X${i}`, data: String.fromCharCode(68 + i),
        }))
  }
  ds.addModification({uid: "1", data: "FA"}, {uid: "1", data: "B"}, domainKeyHelper, false)
  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "1", data: "FA" },
    { uid: "X3", data: "G" },
    { uid: "X4", data: "H" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "2", data: "C" },
    { uid: "X0", data: "D" },
    { uid: "X1", data: "E" },
    { uid: "X2", data: "F" },
  ])
})

test("getPage with new drafts on last page and one db record inserted #2", () => {
  const db = testRecordStore(6)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  for (let i = 0; i<2; i++) ds.unPinDraft(ds.addNew(
      { uid: `X${i}`, data: String.fromCharCode(71 + i),
      }))
  ds.addModification({uid: "1", data: "I"}, {uid: "1", data: "B"}, domainKeyHelper, false)
  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X0", data: "G" },
    { uid: "X1", data: "H" },
    { uid: "1", data: "I" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
    { uid: "5", data: "F" },
  ])
})

test("getPage with empty db and more than a page of drafts", () => {
  const db = testRecordStore(0)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  for (let i = 7; i >= 0; i--) ds.addNew(
      { uid: `X${i}`, data: String.fromCharCode(65 + i),
      })

  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X2", data: "C" },
    { uid: "X1", data: "B" },
    { uid: "X0", data: "A" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X7", data: "H" },
    { uid: "X6", data: "G" },
    { uid: "X5", data: "F" },
    { uid: "X4", data: "E" },
    { uid: "X3", data: "D" },
  ])
})

test("getPage with empty db and more than a page of drafts, some pinned", () => {
  const db = testRecordStore(0)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  for (let i = 7; i >= 0; i--) {
    const draft = ds.addNew(
      { uid: `X${i}`, data: String.fromCharCode(65 + i),
      })
    if ((i % 2) == 0) ds.unPinDraft(draft)
  }

  let page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X5", data: "F" },
    { uid: "X3", data: "D" },
    { uid: "X1", data: "B" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "X0", data: "A" },
    { uid: "X2", data: "C" },
    { uid: "X4", data: "E" },
    { uid: "X6", data: "G" },
    { uid: "X7", data: "H" },
  ])
})

test("getPage with new drafts", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addNew({ uid: "18", data: "ZZ" })
  ds.addNew({ uid: "17", data: "BA" })

  let page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "P" },
    { uid: "16", data: "Q" },
    { uid: "18", data: "ZZ" },
    { uid: "17", data: "BA" },
  ])

  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "2", data: "C" },
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
  ])
})

test("getPage with new drafts, then pin and modify them", () => {
  const db = testRecordStore(17)
  const ds = new SimpleDraftStore()

  const pageMerger = new PageMerger(db, ds, domainKeyHelper)
  ds.addNew({ uid: "18", data: "ZZ" })
  ds.addNew({ uid: "17", data: "BA" })

  let page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "P" },
    { uid: "16", data: "Q" },
    { uid: "18", data: "ZZ" },
    { uid: "17", data: "BA" },
  ])
  ds.addModification({ uid: "18", data: "AB" }, undefined, domainKeyHelper)
  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "15", data: "P" },
    { uid: "16", data: "Q" },
    { uid: "18", data: "AB" },
    { uid: "17", data: "BA" },
  ])
  ds.unpinAll()
  page = pageMerger.getPage(3)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "13", data: "N" },
    { uid: "14", data: "O" },
    { uid: "15", data: "P" },
    { uid: "16", data: "Q" },
  ])
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "18", data: "AB" },
    { uid: "1", data: "B" },
    { uid: "17", data: "BA" },
    { uid: "2", data: "C" },
  ])
  page = pageMerger.getPage(1)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "3", data: "D" },
    { uid: "4", data: "E" },
    { uid: "5", data: "F" },
    { uid: "6", data: "G" },
    { uid: "7", data: "H" },
  ])
  page = pageMerger.getPage(2)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "8", data: "I" },
    { uid: "9", data: "J" },
    { uid: "10", data: "K" },
    { uid: "11", data: "L" },
    { uid: "12", data: "M" },
  ])
  ds.addModification({ uid: "18", data: "CA" }, undefined, domainKeyHelper)
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "18", data: "CA" },
    { uid: "1", data: "B" },
    { uid: "17", data: "BA" },
    { uid: "2", data: "C" },
  ])
  ds.unpinAll()
  page = pageMerger.getPage(0)
  expect(page).not.toBeUndefined()
  expect(page).toEqual([
    { uid: "0", data: "A" },
    { uid: "1", data: "B" },
    { uid: "17", data: "BA" },
    { uid: "2", data: "C" },
    { uid: "18", data: "CA" },
  ])

})
