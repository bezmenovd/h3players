
export type Online = {
    datetime: string
    online: number
}

export async function online(after?: number): Promise<Online[]> {
    if (after) {
        return fetch(`/api/lobby/online?after=${after}`).then(r => r.json()).then(r => r.online);
    } else {
        return fetch(`/api/lobby/online`).then(r => r.json()).then(r => r.online);
    }
}
