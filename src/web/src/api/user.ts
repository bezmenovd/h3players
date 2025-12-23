import { Player } from "./players";
import api from "../api";


export type Restriction = {
    player_id: number
    start_at: number
    finish_at: number
    reason: string
}

export type Me = Player & {
    permissions: string[]
    restriction: Restriction|null
    blacklist: number[]
}

export async function getMe(): Promise<Me> {
    return api.get(`/user/me`).then(r => r.data);
}

export async function blacklist(target_id: number, add: boolean = true): Promise<void> {
    return api.post('/user/blacklist', {
        target_id,
        add,
    }).then(r => r.data)
}
