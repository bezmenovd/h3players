import { Msg } from "./websocket"


type OnlineChanged = Msg & {
    value: number
}

type VisitorsChanged = Msg & {
    value: number
}


export type MsgAvailable = OnlineChanged 
    | VisitorsChanged

