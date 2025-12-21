import api from "../api"
import { MessageWithInfo } from "./messages"


export type Post = {
    id: number
    slug: string
    player_id: number
    discussion_id: number
    title: string
    text: string
    created_at: number
    updated_at: number
}

export type PostWithInfo = Post & {
    player_name: string
    comments: MessageWithInfo[]
}


export async function getList(discussionId?: number): Promise<PostWithInfo[]> {
    return api.get('/posts', {
        params: {
            discussionId,
        }
    }).then(r => r.data)
}

export async function add(title: string, text: string, discussion_id: number): Promise<Post> {
    return api.post('/posts/add', {
        title,
        text,
        discussion_id,
    }).then(r => r.data)
}

export async function update(id: number, title: string, text: string, discussion_id: number): Promise<Post> {
    return api.post(`/posts/${id}`, {
        title,
        text,
        discussion_id,
    }).then(r => r.data)
}


