

interface OnlineChanged {
    route: 'online-changed'
    value: number
}

interface VisitorsChanged {
    route: 'visitors-changed'
    value: number
}


export type MsgAvailable = OnlineChanged 
    | VisitorsChanged
