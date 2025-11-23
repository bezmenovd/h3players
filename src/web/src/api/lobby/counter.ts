import axios from "axios";


export type Visitors = {
    value: number
}

export type Games = {
    value: number
}


export async function getVisitors(): Promise<Visitors> {
    return axios.get(`/api/lobby/counter/visitors`).then(r => r.data);
}

export async function getGames(): Promise<Games> {
    return axios.get(`/api/lobby/counter/games`).then(r => r.data);
}
