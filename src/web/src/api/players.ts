import axios from "axios";

export type Player = {
    id: number
    name: string
}

export async function getList(limit: number, offset: number): Promise<Player[]> {
    return axios.get(`/api/players?limit=${limit}&offset=${offset}`).then(r => r.data);
}

export async function search(query: string): Promise<Player[]> {
    return axios.get(`/api/players/search?query=${query}`).then(r => r.data);
}

export type PlayerDetailInfo = {
    id: number
    name: string
}

export async function getPlayer(id: number): Promise<PlayerDetailInfo> {
    return axios.get(`/api/players/${id}`).then(r => r.data);
}
