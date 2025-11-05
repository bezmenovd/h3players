
export type Online = {
    timestamp: number
    online: number
}

export async function onlineChart(after?: number): Promise<Online[]> {
    if (after) {
        return fetch(`/api/lobby/onlineChart?after=${after}`).then(r => r.json());
    } else {
        return fetch(`/api/lobby/onlineChart`).then(r => r.json());
    }
}
