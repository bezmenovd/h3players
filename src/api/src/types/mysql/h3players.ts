
export type Discussion = {
    id: number
    player_id: number
    created_at: number
    is_public: boolean
    is_visible: boolean
    name: string
    slug: string
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
}

export type Post = {
    id: number
    player_id: number
    discussion_id: number
    title: string
    text: string
}

export type PostWithInfo = Post & {
    player_name: string
    comments: MessageWithInfo[]
}

export type Restriction = {
    player_id: number
    start_at: number
    finish_at: number
    reason: string
}
