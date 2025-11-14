
export type Player = {
    id: number
    name: string
}

export async function getList(limit: number, offset: number): Promise<Player[]> {
    return fetch(`/api/players?limit=${limit}&offset=${offset}`).then(r => r.json());
}

export async function search(query: string): Promise<Player[]> {
    return fetch(`/api/players/search?query=${query}`).then(r => r.json());
}

export type PlayerDetailInfo = {
    id: number
    name: string
}

export async function getPlayer(id: number): Promise<PlayerDetailInfo> {
    return fetch(`/api/players/${id}`).then(r => r.json());
}
