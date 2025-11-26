import axios from "axios";
import { Paginated } from "./general";

export type Template = {
    id: number
    name: string
}

export type TemplateWithInfo = Template & {
    games_count: number
}

export async function getList(limit: number, offset: number, ids: number[] = [], query?: string): Promise<Paginated<TemplateWithInfo>> {
    return axios.get(`/api/templates`, {
        params: {
            limit,
            offset,
            ...(ids?.length ? { ids: ids.join(',') } : {}),
            ...(query?.length ? { query } : {}),
        }
    }).then(r => r.data);
}
