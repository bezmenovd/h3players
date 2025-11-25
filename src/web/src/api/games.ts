import axios from "axios";
import { Paginated } from "./general";


export type Game = {
    id: number
    template_id: number
    game_type: number
    size: number
    levels: number
    status: number
    restarts: number
    end_day: number
    start_timestamp: number
    end_timestamp: number
    host_id: number
    host_color: number
    host_town: number
    host_hero: number
    host_old_rating: number
    host_new_rating: number
    opponent_id: number
    opponent_color: number
    opponent_town: number
    opponent_hero: number
    opponent_old_rating: number
    opponent_new_rating: number
}

export type GameWithInfo = Game & {
    host_name: string|null
    opponent_name: string|null
    template_name: string|null
}


export async function getList(limit: number, offset: number = 0): Promise<Paginated<GameWithInfo>> {
    return axios.get(`/api/games`, { 
        params: { 
            limit,
            offset, 
        } 
    }).then(r => r.data);
}
