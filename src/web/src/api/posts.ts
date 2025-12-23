import api from "../api"
import { Message, MessageWithInfo } from "./messages"
import { VoteWithInfo } from "./votes"


export type Post = {
    id: number
    slug: string
    player_id: number
    discussion_id: number
    title: string
    text: string
    created_at: number
    updated_at: number
    views_count: number
}

export type PostWithInfo = Post & {
    player_name: string
    comments: MessageWithInfo[]
    votes: VoteWithInfo[]
}


export async function getList(discussionId: number|null, sort: string = 'new', query: string = ''): Promise<PostWithInfo[]> {
    return api.get('/posts', {
        params: {
            discussionId,
            sort,
            query,
        }
    }).then(r => r.data)
}

export async function add(title: string, text: string, discussion_id: number): Promise<Post> {
    return api.post('/posts/add', {
        title,
        text,
        discussion_id,
    }, {
        _errorsPath: 'errors.posts.add',
        _contentLoader: true,
    }).then(r => r.data)
}

export async function update(id: number, title: string, text: string, discussion_id: number): Promise<Post> {
    return api.post(`/posts/${id}`, {
        title,
        text,
        discussion_id,
    }, {
        _errorsPath: 'errors.posts.update',
        _contentLoader: true,
    }).then(r => r.data)
}

export async function addMessage(post_id: number, parent_id: number|null, text: string): Promise<Message> {
    return api.post('/posts/add_message', {
        post_id,
        parent_id,
        text,
    }, {
        _errorsPath: 'errors.posts.addMessage',
        _contentLoader: true,
    }).then(r => r.data)
}

export async function registerView(id: number): Promise<void> {
    return api.post(`/posts/${id}/register_view`)
}

export async function vote(entity_type: number, entity_id: number, type: number): Promise<void> {
    return api.post(`/posts/vote`, {
        entity_type,
        entity_id,
        type,
    })
}

export async function getBySlug(slug: string): Promise<PostWithInfo> {
    return api.get(`/posts/by_slug/${slug}`).then(r => r.data)
}

