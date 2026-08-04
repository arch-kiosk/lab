// oxlint-disable typescript/no-explicit-any

export type DataRecord = {uid: string } & Record<string, any>
export type DataNotification = {
    currentRecord?: number
    countChanged?: boolean
}

export type DataNotifier = (notification?: DataNotification) => void

export interface DomainKeyHelper<T> {
    extractKey(record: DataRecord): T,
    compareKeys(key1: T, key2: T): number
}

