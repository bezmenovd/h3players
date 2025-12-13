import axios from "axios";
import { Player } from "./players";


export async function getMe(token: string): Promise<Player|null> {
    return axios.get(`/api/user/me`, {
        headers: {
            Token: token,
        }
    }).then(r => r.data);
}
