import { alerts } from "../components/UI/alerts";
import { MsgAvailable } from "./websocket.messages";
import i18n from "../i18n";


let websocket: WebSocket|null = null

let listeners: Map<string, ((msg: any) => void)[]> = new Map()
let onDisconnect: (() => void)[] = []
let queue: (string | ArrayBuffer)[] = []

export const connect = () => {
    const t = i18n.global.t;

    if (location.host === 'localhost') {
        websocket = new WebSocket(`ws://${location.host}:8000`);
    } else {
        websocket = new WebSocket(`wss://${location.host}/ws`);
    }

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
        alerts.send('error', t('error.websocket.onerror'))
    }
    
    websocket.onclose = () => {
        onDisconnect.forEach(h => h())
        let reconnectionInterval = setInterval(() => {
            try {
                connect()
                clearInterval(reconnectionInterval)
            } catch (e) {}
        }, 30000)
    }
}

export type Listener = {
    unsubscribe: () => void
    onDisconnect: (handler: () => void) => void
}

export function on<R extends MsgAvailable['route']>(
    route: R,
    listener: (msg: Extract<MsgAvailable, { route: R }>) => void,
    params: object = {}
): Listener {
    if (! listeners.has(route)) {
        listeners.set(route, [])
    }
    if (websocket?.readyState === WebSocket.OPEN) {
        websocket!.send(JSON.stringify({ type: 'subscribe', route: route, params }))
    } else {
        queue.push(JSON.stringify({ type: 'subscribe', route: route, params }))
    }

    listeners.get(route)!.push(listener)

    return {
        unsubscribe: () => {
            const arr = listeners.get(route)
            if (arr) {
                const idx = arr.indexOf(listener)
                if (idx > -1) arr.splice(idx, 1)
                if (arr.length === 0) {
                    if (websocket?.readyState === WebSocket.OPEN) {
                        websocket!.send(JSON.stringify({ type: 'unsubscribe', route: route, params }))
                    } else {
                        queue.push(JSON.stringify({ type: 'unsubscribe', route: route, params }))
                    }
                }
            }
        },
        onDisconnect: (handler: () => void) => {
            onDisconnect.push(handler)
        }
    }
}
