

interface LobbyOnlineChanged {
    route: 'lobby.counter.online.update'
    value: number
}

interface LobbyVisitorsChanged {
    route: 'lobby.counter.visitors.update'
    value: number
}

interface LobbyGamesChanged {
    route: 'lobby.counter.games.update'
    value: number
}

interface DataGamesUpdate {
    route: 'data.games.update'
    value: number
}

interface DataGamesVUpdate {
    route: 'data.games_v.update'
    value: number
}

interface DataPlayersUpdate {
    route: 'data.players.update'
    id: number[]
}

interface DateTemplatesUpdate {
    route: 'data.templates.update'
    id: number[]
}

interface Auth {
    route: 'auth'
    token: string
}


export type MsgAvailable = LobbyOnlineChanged 
    | LobbyVisitorsChanged
    | LobbyGamesChanged
    | DataGamesVUpdate
    | DataGamesUpdate
    | DataPlayersUpdate
    | DateTemplatesUpdate
    | Auth
