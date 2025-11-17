
export type Statistics = {
    name: string
    timestamp: number
    sent_bytes: number
    sent_messages: number
    received_bytes: number
    received_messages: number
}

export async function chart(after?: number): Promise<Statistics[]> {
    return fetch(`/api/performance/chart?after=${after}`).then(r => r.json());
}
