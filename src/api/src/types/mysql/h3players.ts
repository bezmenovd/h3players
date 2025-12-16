
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
    messages_count: number
}
