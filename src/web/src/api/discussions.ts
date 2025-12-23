import api from "../api"

export type Discussion = {
    id: number
    player_id: number
    created_at: number
    name: string
}

export type DiscussionWithInfo = Discussion & {
    player_name: string
    posts_count: number
}


export async function getList(): Promise<DiscussionWithInfo[]> {
    return api.get('/discussions').then(r => r.data)
}

export async function add(name: string): Promise<{}> {
    return api.post('/discussions/add', { name }, {
        _errorsPath: 'errors.discussions.add',
        _contentLoader: true,
    }).then(r => r.data)
}
