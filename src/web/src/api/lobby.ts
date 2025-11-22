import axios from "axios";
import { GameWithInfo } from "./games";

export type Online = {
    timestamp: number
    online: number
}

export async function chart(after?: number): Promise<Online[]> {
    return axios.get(`/api/lobby/chart`, { 
        params: { 
            after 
        } 
    }).then(r => r.data);
}

export async function getLastGames(): Promise<GameWithInfo[]> {
    return axios.get(`/api/lobby/lastGames`).then(r => r.data);
}
