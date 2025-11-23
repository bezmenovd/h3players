import axios from "axios";
import { GameWithInfo } from "./games";

export type Online = {
    timestamp: number
    online: number
}

export async function getChart(after?: number): Promise<Online[]> {
    return axios.get(`/api/lobby/chart`, { 
        params: { 
            after 
        } 
    }).then(r => r.data);
}

export async function getDailyGames(limit: number, offset: number = 0): Promise<GameWithInfo[]> {
    return axios.get(`/api/lobby/dailyGames`, { 
        params: { 
            limit,
            offset, 
        } 
    }).then(r => r.data);
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

export async function getDailyTop(limit: number, offset: number = 0): Promise<DailyTop> {
    return axios.get(`/api/lobby/dailyTop`, { 
        params: { 
            limit,
            offset, 
        } 
    }).then(r => r.data);
}
