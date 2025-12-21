

export type Vote = {
    player_id: number
    type: number
    at: number
}

export type VoteWithInfo = Vote & {
    player_name: string
}

