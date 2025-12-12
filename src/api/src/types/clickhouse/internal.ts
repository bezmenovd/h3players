
export type Statistics = {
    timestamp: number
    name: string
    sent_bytes: number
    sent_messages: number
    received_bytes: number
    received_messages: number
}

export type Request = {
    datetime: number
    duration: number
    ip_hash: string
    method: string
    url: string
    body: string
    status: number
}
