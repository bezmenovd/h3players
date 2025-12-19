import api from "../api"
import { MessageWithInfo } from "./messages"


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


export async function getList(discussionId?: number): Promise<PostWithInfo[]> {
    return api.get('/posts', {
        params: {
            discussionId,
        }
    }).then(r => r.data)
}

export async function add(title: string, text: string, discussion_id: number): Promise<Post> {
    return api.post('/posts', {
        params: {
            title,
            text,
            discussion_id,
        }
    }).then(r => r.data)
}


