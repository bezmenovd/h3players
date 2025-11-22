import axios from "axios";

export type Online = {
    timestamp: number
    online: number
}

export async function chart(after?: number): Promise<Online[]> {
    return axios.get(`/api/lobby/chart`, { 
        params: { 
            after 
        } 
    }).then(r => r.data);
}

export type Visitors = {
    value: number
}

export async function visitors(): Promise<Visitors> {
    return axios.get(`/api/lobby/visitors`).then(r => r.data);
}

export async function games(): Promise<Visitors> {
    return axios.get(`/api/lobby/games`).then(r => r.data);
}
