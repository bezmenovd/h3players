import axios from "axios";

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

export async function list(playerId: number, limit?: number, offset?: number): Promise<GameV[]> {
    return axios.get(`/api/games`, {
        params: {
            playerId,
            limit,
            offset
        }
    }).then(r => r.data);
}
