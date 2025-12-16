import { Paginated } from "./_general";
import api from "../api";


export type GameV = {
    player_id: number
    opponent_id: number
    game_id: number
    template_id: number
    is_random: boolean
    size: number
    levels: number
    is_win: boolean
    is_draw: boolean
    is_loss: boolean
    restarts: number
    end_day: number
    start_timestamp: number
    end_timestamp: number
    player_color: number
    player_town: number
    player_hero: number
    player_old_rating: number
    player_new_rating: number
    opponent_color: number
    opponent_town: number
    opponent_hero: number
    opponent_old_rating: number
    opponent_new_rating: number
}

export type GameVWithInfo = GameV & {
    player_name: string|null
    opponent_name: string|null
    template_name: string|null
}


export async function getList(playerId: number, limit?: number, offset?: number): Promise<Paginated<GameVWithInfo>> {
    return api.get(`/games_v`, {
        params: {
            playerId,
            limit,
            offset
        }
    }).then(r => r.data);
}
