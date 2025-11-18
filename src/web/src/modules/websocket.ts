import { MsgAvailable } from "./websocket.messages";


export type Msg = {
    route: string
}


const websocket = new WebSocket(`ws://${location.host}:8000`)

const listeners: Map<string, ((msg: any) => void)[]> = new Map()

websocket.onmessage = (e) => {
    const msg = JSON.parse(e.data as string) as Msg
    const route = msg.route

    if (listeners.has(route)) {
        listeners.get(route)!.forEach(l => l(msg))
    }
}

export function on<T extends MsgAvailable>(
    route: T['route'],
    listener: (msg: T) => void,
) {
    if (! listeners.has(route)) {
        listeners.set(route, [])
    }
    if (listeners.get(route)!.length === 0) {
        websocket.send(JSON.stringify({ type: 'subscribe', route: route }))
    }

    listeners.get(route)!.push(listener)

    return () => {
        const arr = listeners.get(route)
        if (arr) {
            const idx = arr.indexOf(listener)
            if (idx > -1) arr.splice(idx, 1)
            if (arr.length === 0) {
                websocket.send(JSON.stringify({ type: 'unsubscribe', route: route }))
            }
        }
    }
}
