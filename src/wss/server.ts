import { logger } from './src/services/logger'
import { createClient } from 'redis'
import { WebSocket, WebSocketServer } from 'ws';
import { throttle } from './src/helpers/functions';
import { lobby } from './src/services/clickhouse';
import timestamp from './src/helpers/timestamp';


async function main() {
    logger.info('starting..')
    
    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    const redisSub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisSub.connect()


    const wss = new WebSocketServer({ port: 8000 });

    const subscribers = new Map<string, Set<WebSocket>>()

    function addSubscriber(route: string, ws: WebSocket) {
        if (!subscribers.has(route)) {
            subscribers.set(route, new Set())
        }
        subscribers.get(route)!.add(ws)
    }

    function removeSubscriber(route: string, ws: WebSocket) {
        const set = subscribers.get(route)
        if (set) {
            set.delete(ws)
            if (set.size === 0) subscribers.delete(route)
        }
    }

    wss.on('connection', (ws) => {
        ws.on('message', (data) => {
            const msg = JSON.parse(data.toString()) as { type: 'subscribe' | 'unsubscribe'; route: string }

            if (msg.type === 'subscribe' && msg.route) {
                addSubscriber(msg.route, ws)
            }

            else if (msg.type === 'unsubscribe' && msg.route) {
                removeSubscriber(msg.route, ws)
            }
        })

        ws.on('close', () => {
            for (const [route, clients] of subscribers) {
                if (clients.has(ws)) {
                    clients.delete(ws)
                    if (clients.size === 0) subscribers.delete(route)
                }
            }
        })
    })

    redisSub.subscribe('live:spectator:online', (data) => {
        const { value } = JSON.parse(data) as { value: number }

        subscribers.get('online-changed')?.forEach(client => {
            client.send(JSON.stringify({ route: 'online-changed', value: value }))
        })
    })

    redisSub.subscribe('live:spectator:visitors', (data) => {
        const { value } = JSON.parse(data) as { value: number }

        subscribers.get('visitors-changed')?.forEach(client => {
            client.send(JSON.stringify({ route: 'visitors-changed', value: value }))
        })
    })

    let sendDailyGames = throttle(async () => {
        let count = await (await lobby().query({
            query: `
                SELECT count(*) as value
                FROM games
                WHERE end_timestamp >= {startOfDay:UInt32}
            `,
            query_params: {
                startOfDay: timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json<{ value: number }>()

        subscribers.get('games-changed')?.forEach(client => {
            client.send(JSON.stringify({ route: 'games-changed', value: count[0].value }))
        })
    }, 500)

    redisSub.subscribe('live:journalist:games', () => {
        sendDailyGames()
    })
}

main()
