import { Paginated } from "./_general";
import api from "../api";

export type Player = {
    id: number
    name: string
}

export async function getList(limit: number, offset: number, ids: number[] = []): Promise<Paginated<Player>> {
    return api.get(`/players`, {
        params: {
            limit,
            offset,
            ...(ids?.length ? { ids: ids.join(',') } : {}),
        }
    }).then(r => r.data);
}

export async function search(query: string): Promise<Player[]> {
    return api.get(`/players/search?query=${query}`).then(r => r.data);
}

export type PlayerDetailInfo = {
    id: number
    name: string
    rank: number
}

export async function getPlayer(id: number): Promise<PlayerDetailInfo> {
    return api.get(`/players/${id}`).then(r => r.data);
}
