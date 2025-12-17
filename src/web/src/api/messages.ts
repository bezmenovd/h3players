

export type Message = {
    id: number
    player_id: number
    post_id: number
    parent_id: number
    text: string
}

export type MessageWithInfo = Message & {
    player_name: string
}

