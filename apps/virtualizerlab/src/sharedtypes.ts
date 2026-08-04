// oxlint-disable typescript/no-explicit-any

export type DataRecord = {uid: string } & Record<string, any>
export type DataNotification = {
    currentRecord?: number
    countChanged?: boolean
}

export type DataNotifier = (notification?: DataNotification) => void
