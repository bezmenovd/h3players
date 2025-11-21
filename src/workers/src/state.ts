
export type Player = {
    id: number
    name: string
    rating: number
    flag: number
}

export type Room = {
    hostId: number
    size: number
    members: number[]
    description: string
    flags: {
        onRating: boolean,
        isStarted: boolean,
        hasPassword: boolean,
    },
    timestamp?: number
    gameId?: number
}


export type State = {
    players: Map<number, Player>
    hiddenPlayers: Set<number>
    rooms: Map<number, Room>
    lastUpdate?: number
}

export const createState = () => {
    return {
        players: new Map<number, Player>(),
        hiddenPlayers: new Set<number>(),
        rooms: new Map<number, Room>(),
        lastUpdate: undefined,
    }
}
