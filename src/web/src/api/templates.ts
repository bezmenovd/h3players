import axios from "axios";
import { Paginated } from "./general";

export type Template = {
    id: number
    name: string
}

export async function getList(limit: number, offset: number, ids: number[] = []): Promise<Paginated<Template>> {
    return axios.get(`/api/templates`, {
        params: {
            limit,
            offset,
            ...(ids?.length ? { ids: ids.join(',') } : {}),
        }
    }).then(r => r.data);
}

export async function search(query: string): Promise<Template[]> {
    return axios.get(`/api/templates/search?query=${query}`).then(r => r.data);
}
