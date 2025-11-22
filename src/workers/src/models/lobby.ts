
export type GameModel = {
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

export type GameVModel = {
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
