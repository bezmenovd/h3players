import api from "../api"

export type Statistics = {
    name: string
    timestamp: number
    sent_bytes: number
    sent_messages: number
    received_bytes: number
    received_messages: number
}

export async function getChart(after?: number): Promise<Statistics[]> {
    return api.get(`/performance/chart`, { 
        params: { 
            after 
        } 
    }).then(r => r.data);
}
