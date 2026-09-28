// oxlint-disable typescript/no-explicit-any

export type DataRecord = { uid: string } & Record<string, any>
export type RecordState = 'draft' | 'new' | undefined

export type VirtualScrollContainerDataRecord = { uid: string } & Record<string, any>

export interface VirtualScrollContainerDataProvider {
    //used by virtual scroll layout:
    recordCount(): number | undefined

    setNotifier(notifier: DataNotifier): void

    getRecord(
        index: number,
        bufferedOnly?: boolean,
        notify?: (index: number) => void,
    ): VirtualScrollContainerDataRecord | undefined

    getRecordState(uid: string): 'draft' | 'new' | undefined

    setActiveRecord(index: number): void

    dataChanged(recordIndex: number, fieldId: string, value: unknown): void
}


export type DataNotification = {
    currentRecord?: number
    countChanged?: boolean
}

export type DataNotifier = (notification?: DataNotification) => void

export interface DomainKeyHelper<T> {
    extractKey(record: DataRecord): T,

    compareKeys(key1: T, key2: T): number
}

/** todo: this does not belong in this package. AppFoundation? */
export interface DataProvider extends VirtualScrollContainerDataProvider {
    // //used by virtual scroll layout:
    // recordCount(): number | undefined
    // getRecord(
    //     index: number,
    //     bufferedOnly?: boolean,
    //     notify?: (index: number) => void,
    // ): DataRecord | undefined
    // getRecordState(uid: string) : RecordState
    // setActiveRecord(index: number): void
    // dataChanged(recordIndex: number, fieldId: string, value: unknown): void

    //not used by virtual scroll layout:
    getTelemetry?(): { cached: number; capacity: number }

    logTelemetry?(): void

    addRecord(record: DataRecord): void

    deleteRecords(uids: string[]): Promise<void>

    onValidateField?: <T>(recordIndex: number, fieldId: string, value: T) => undefined | ValidationResultsReturnType<T>
    onValidateRecord?: <T extends DataRecord>(recordIndex: number, record: T) => undefined  | ValidationResultsReturnType<T>
}

export type DataProviderValidationStates = 'unknown' | 'error' | 'warning' | 'valid'
export type ValidationResultsReturnType<T> = [Array<DataProviderValidationResult>, T | undefined]

export interface DataProviderValidationResults {
    result: DataProviderValidationStates
    fields?: Record<string, Array<DataProviderValidationResult>>
    record?: Array<DataProviderValidationResult>
}

export type DataProviderValidationResult = {
    result: DataProviderValidationStates
    msg?: string
}

