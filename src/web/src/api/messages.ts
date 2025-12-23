import { VoteWithInfo } from "./votes"


export type Message = {
    id: number
    player_id: number
    post_id: number
    parent_id: number
    created_at: number
    updated_at: number
    text: string
}

export type MessageWithInfo = Message & {
    player_name: string
    votes: VoteWithInfo[]
    children: MessageWithInfo[]
}

