import axios from "axios"

export type Statistics = {
    name: string
    timestamp: number
    sent_bytes: number
    sent_messages: number
    received_bytes: number
    received_messages: number
}

export async function chart(after?: number): Promise<Statistics[]> {
    return axios.get(`/api/performance/chart`, { 
        params: { 
            after 
        } 
    }).then(r => r.data);
}
