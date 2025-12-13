import { logger } from './src/services/logger'
import { createClient } from 'redis'
import { WebSocket, WebSocketServer } from 'ws';
import { throttle } from './src/helpers/functions';
import { lobby } from './src/services/clickhouse';
import timestamp from './src/helpers/timestamp';
import mysql from 'mysql2/promise';
import crypto from 'crypto'


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

    const mysqlH3players = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });


    const wss = new WebSocketServer({ port: 8000 });

    const clients = new Map<string, WebSocket>()

    const subscribers: Map<string, Map<string, {
        time: number,
        params: object,
    }>> = new Map([
        ['lobby.counter.online.update', new Map()],
        ['lobby.counter.visitors.update', new Map()],
        ['lobby.counter.games.update', new Map()],
        ['data.games.update', new Map()],
        ['data.games_v.update', new Map()],
        ['data.players.update', new Map()],
        ['data.templates.update', new Map()],
        ['auth', new Map()],
    ])

    wss.on('connection', (ws, req) => {
        const headerIp = req.headers['x-real-ip']
        const ip = crypto.createHash('sha256')
            .update(Array.isArray(headerIp) ? headerIp[0] : headerIp || 'unknown')
            .digest('hex')
            .substring(0, 32)

        const id = ip + String(Date.now())

        if (clients.has(id)) {
            return
        }

        clients.set(id, ws)

        ws.on('message', (data) => {
            const msg = JSON.parse(data.toString()) as { 
                type: 'subscribe' | 'unsubscribe'; 
                route: string,
                params?: object,
            }

            if (msg.type === 'subscribe' && msg.route) {

                if (msg.route === 'auth') {
                    let foundSame = false
                    let msgParams = msg.params as { playerId: number, code: string }
                    subscribers.get('auth')!.forEach(subscriber => {
                        let subscriberParams = subscriber.params as { playerId: number, code: string }
                        if (subscriberParams.playerId === msgParams.playerId && subscriberParams.code === msgParams.code) {
                            logger.info(`subscribe.auth: foundSame: player#${msgParams.playerId} code=${msgParams.code}}`)
                            foundSame = true
                        }
                    })
                    if (! foundSame) {
                        subscribers.get(msg.route)?.set(id, {
                            time: timestamp.now(),
                            params: msg.params ?? {},
                        })
                    }
                } else {
                    subscribers.get(msg.route)?.set(id, {
                        time: timestamp.now(),
                        params: msg.params ?? {},
                    })
                }
            }

            else if (msg.type === 'unsubscribe' && msg.route) {
                subscribers.get(msg.route)?.delete(id)
            }
        })

        ws.on('close', () => {
            for (const [name, line] of subscribers) {
                line.delete(id)
            }

            clients.delete(id)
        })
    })

    redisSub.subscribe('live:spectator:online', (data) => {
        const { value } = JSON.parse(data) as { value: number }

        subscribers.get('lobby.counter.online.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'lobby.counter.online.update', value: value }))
        })
    })

    redisSub.subscribe('live:spectator:visitors', (data) => {
        const { value } = JSON.parse(data) as { value: number }

        subscribers.get('lobby.counter.visitors.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'lobby.counter.visitors.update', value: value }))
        })
    })

    let dailyGamesOldValue = 0

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

        if (dailyGamesOldValue === count[0].value) {
            return
        }

        dailyGamesOldValue = count[0].value

        subscribers.get('lobby.counter.games.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'lobby.counter.games.update', value: count[0].value }))
        })
    }, 500)

    redisSub.subscribe('live:processor:games', async (msg) => {
        subscribers.get('data.games.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'data.games.update' }))
        })

        sendDailyGames()
    })

    redisSub.subscribe('live:processor:games_v', async (msg) => {
        let data = JSON.parse(msg) as { player_id: number[] }

        subscribers.get('data.games_v.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'data.games_v.update', ...data }))
        })
    })

    redisSub.subscribe('live:processor:players', async (msg) => {
        let data = JSON.parse(msg) as { id: number[] }

        subscribers.get('data.players.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'data.players.update', ...data }))
        })
    })

    redisSub.subscribe('live:processor:templates', async (msg) => {
        let data = JSON.parse(msg) as { id: number[] }

        subscribers.get('data.templates.update')!.keys().forEach(id => {
            clients.get(id)!.send(JSON.stringify({ route: 'data.templates.update', ...data }))
        })
    })

    redisSub.subscribe('h3players:message', async (msg) => {
        let data = JSON.parse(msg) as { playerId: number, message: string }

        let receiverId: string | null = null

        for (const [id, sub] of subscribers.get('auth')!) {
            let subParams = sub.params as { playerId: number, code: string }

            if (data.playerId === subParams.playerId && data.message === subParams.code) {
                receiverId = id
                break
            }
        }

        if (receiverId !== null) {
            const client = clients.get(receiverId)!

            subscribers.get('auth')!.forEach((subscriber, id) => {
                if ((subscriber.params as { playerId: number }).playerId === data.playerId) {
                    subscribers.get('auth')!.delete(id)
                }
            })

            let token = crypto.createHash('sha256').update(String(crypto.randomInt(281474976710655))).digest('hex').substring(0, 32)

            await mysqlH3players.execute(
                'INSERT INTO tokens (player_id, token) VALUES (?, ?)',
                [data.playerId, token]
            )

            client.send(JSON.stringify({ route: 'auth', token: token }))
        }
    })
}

main()
