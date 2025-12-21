
export type Discussion = {
    id: number
    player_id: number
    created_at: number
    is_public: boolean
    is_visible: boolean
    name: string
}

export type DiscussionWithInfo = Discussion & {
    player_name: string
    posts_count: number
}

export type Message = {
    id: number
    player_id: number
    post_id: number
    parent_id: number
    text: string
}

export type MessageWithInfo = Message & {
    player_name: string
    votes: VoteWithInfo[]
}

export type Vote = {
    player_id: number
    type: number
    at: number
}

export type VoteWithInfo = Vote & {
    player_name: string
}

export type Post = {
    id: number
    player_id: number
    discussion_id: number
    title: string
    text: string
    views_count: number
}

export type PostWithInfo = Post & {
    player_name: string
    comments: MessageWithInfo[]
    votes: VoteWithInfo[]
}

export type Restriction = {
    player_id: number
    start_at: number
    finish_at: number
    reason: string
}
