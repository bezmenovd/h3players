import { Player } from "./players";
import api from "../api";


export async function getMe(): Promise<Player|null> {
    return api.get(`/user/me`).then(r => r.data);
}
