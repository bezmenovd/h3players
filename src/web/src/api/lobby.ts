
export type Online = {
    timestamp: number
    online: number
}

export async function chart(after?: number): Promise<Online[]> {
    return fetch(`/api/lobby/chart?after=${after}`).then(r => r.json());
}
