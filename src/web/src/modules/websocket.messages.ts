

interface LobbyOnlineChanged {
    route: 'lobby.online-changed'
    value: number
}

interface LobbyVisitorsChanged {
    route: 'lobby.visitors-changed'
    value: number
}

interface LobbyGamesChanged {
    route: 'lobby.games-changed'
    value: number
}

interface DataGamesUpdate {
    route: 'data.games-update'
    value: number
}

interface DataPlayersUpdate {
    route: 'data.players-update'
    id: number[]
}

interface DateTemplatesUpdate {
    route: 'data.templates-update'
    id: number[]
}


export type MsgAvailable = LobbyOnlineChanged 
    | LobbyVisitorsChanged
    | LobbyGamesChanged
    | DataGamesUpdate
    | DataPlayersUpdate
    | DateTemplatesUpdate
