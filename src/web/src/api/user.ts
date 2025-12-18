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
}

export async function getMe(): Promise<Me|null> {
    return api.get(`/user/me`).then(r => r.data);
}
