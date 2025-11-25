import axios from "axios";
import { Paginated } from "./general";

export type Player = {
    id: number
    name: string
}

export async function getList(limit: number, offset: number, ids: number[] = []): Promise<Paginated<Player>> {
    return axios.get(`/api/players`, {
        params: {
            limit,
            offset,
            ...(ids?.length ? { ids: ids.join(',') } : {}),
        }
    }).then(r => r.data);
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
