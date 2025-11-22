import { MsgAvailable } from "./websocket.messages";


let websocket: WebSocket|null = null

let connect = () => {
    websocket = new WebSocket(`ws://${location.host}:8000`)

    websocket.onopen = () => {
        for (const data of queue) {
            websocket!.send(data)
        }
    
        queue = []
    }
    
    websocket.onmessage = (e) => {
        const msg = JSON.parse(e.data as string) as { route: string }
        const route = msg.route
    
        if (listeners.has(route)) {
            listeners.get(route)!.forEach(l => l(msg))
        }
    }
    
    websocket.onerror = () => {
        websocket!.close()
    }
    
    websocket.onclose = () => {
        let reconnectionInterval = setInterval(() => {
            try {
                connect()
                clearInterval(reconnectionInterval)
            } catch (e) {}
        }, 10000)
    }
}

connect()

let listeners: Map<string, ((msg: any) => void)[]> = new Map()
let queue: (string | ArrayBuffer)[] = []

export function on<R extends MsgAvailable['route']>(
    route: R,
    listener: (msg: Extract<MsgAvailable, { route: R }>) => void,
) {
    if (! listeners.has(route)) {
        listeners.set(route, [])
    }
    if (listeners.get(route)!.length === 0) {
        if (websocket?.readyState === WebSocket.OPEN) {
            websocket!.send(JSON.stringify({ type: 'subscribe', route: route }))
        } else {
            queue.push(JSON.stringify({ type: 'subscribe', route: route }))
        }
    }

    listeners.get(route)!.push(listener)

    return () => {
        const arr = listeners.get(route)
        if (arr) {
            const idx = arr.indexOf(listener)
            if (idx > -1) arr.splice(idx, 1)
            if (arr.length === 0) {
                if (websocket?.readyState === WebSocket.OPEN) {
                    websocket!.send(JSON.stringify({ type: 'unsubscribe', route: route }))
                } else {
                    queue.push(JSON.stringify({ type: 'unsubscribe', route: route }))
                }
            }
        }
    }
}
