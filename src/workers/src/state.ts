
export type Player = {
    id: number
    name: string
    rating: number
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
    relativeTimestamp?: number
    gameId?: number
}


export type State = {
    players: Map<number, Player>
    rooms: Map<number, Room>
    lastUpdate?: number
}

export const createState = () => {
    return {
        players: new Map<number, Player>(),
        rooms: new Map<number, Room>(),
        lastUpdate: undefined,
    }
}
