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


export type DailyTopPlayerWithRatingDiff = {
    id: number
    name: string
    rating_diff: number
}

export type DailyTopPlayerWithGamesCount = {
    id: number
    name: string
    games_count: number
}

export type DailyTop = {
    byRating: DailyTopPlayerWithRatingDiff[],
    byRatingAnti: DailyTopPlayerWithRatingDiff[],
    byGamesCount: DailyTopPlayerWithGamesCount[],
}

export async function getDailyTop(): Promise<DailyTop> {
    return axios.get(`/api/lobby/dailyTop?limit=7`).then(r => r.data);
}
