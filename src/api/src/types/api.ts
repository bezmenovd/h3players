
export type Paginated<T> = {
    total: number
    limit: number
    offset: number
    items: T[]
}

export type PlayerInfo = {
    id: number
    name: string
}

export type DailyTopPlayerWithRatingDiff = {
    id: number
    name: string
    rating_diff: number
}

export type DailyTopPlayerWithGamesCount = {
    id: number
    name: string
    games_count: number
}
