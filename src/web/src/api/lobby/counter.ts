import api from "../../api";


export type Visitors = {
    value: number
}

export type Games = {
    value: number
}


export async function getVisitors(): Promise<Visitors> {
    return api.get(`/lobby/counter/visitors`).then(r => r.data);
}

export async function getGames(): Promise<Games> {
    return api.get(`/lobby/counter/games`).then(r => r.data);
}
