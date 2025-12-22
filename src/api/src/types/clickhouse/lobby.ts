
export type Online = {
    timestamp: number
    online: number
}

export type Player = {
    id: number
    name: string
}

export type Template = {
    id: number
    name: string
}

export type TemplateStats = {
    games_count: number
    games_duration: number
    players_count: number
}

export type TemplateGamesChartItem = {
    start_of_day: number
    games_count: number
}

export type TemplatesDurationChartItem = {
    duration: number
    games_count: number
}

export type TemplatesEndDayChartItem = {
    end_day: number
    games_count: number
}

export type TemplatesStatisticsChartItem = {
    start_of_day: number
    templates: {
        [key: string]: number
    }
}

export type TemplateWithInfo = Template & TemplateStats & {

}

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
