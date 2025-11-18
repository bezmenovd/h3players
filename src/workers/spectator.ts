import { Client } from './src/client'
import { createState, State } from './src/state'
import { bytesToHex, formatBytes, hexDump, intToBytes } from './src/helpers/bytes'
import fs from 'node:fs'
import { Room, RoomRemove, RoomUpdate, User, UserDisconnect107, UserDisconnect108, UserDisconnect83 } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import { timestamp, date } from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'
import { Postman } from './src/postman'
import config from './config'
import { HistoryAgent } from './src/agents/history'
import { NamesAgent } from './src/agents/names'
import { createClient } from 'redis'
import { debounce } from './src/helpers/functions'


process.env.TZ = 'Europe/Moscow'


async function main() {
    logger.info('starting..')
    
    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()
    await redis.configSet('set-max-intset-entries', '10000000')

    const client = new Client('spectator', 'h3players_bot1')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    let state: State;
    
    client.onConnect(() => {
        state = createState()
    })

    const publishOnline = debounce(async (value: number) => {
        await redis.publish('live:spectator:online', JSON.stringify({ value }))
    }, 100)

    const publishVisitors = debounce(async (value: number) => {
        await redis.publish('live:spectator:visitors', JSON.stringify({ value }))
    }, 100)
    
    let counter = 0
    
    client.onMessage((data: Buffer) => {
        counter++

        let code = data.readUInt16LE(0)
        let buffer = data.subarray(2)
        
        fs.mkdir(`output/server/${code}`, { recursive: true }, () => {})
        fs.writeFile(`output/server/${code}/${counter}`, hexDump(buffer), () => {})
    })

    postman.on(User, async (msg) => {
        let isNew = false

        if (! state.players.has(msg.userId)) {
            isNew = true
        }

        let rating = Number(await redis.get(`spectator:rating:${msg.userId}`)) || -1

        if (rating != msg.rating) {
            redis.rPush('events:spectator:player-rating-changed', JSON.stringify({
                playerId: msg.userId,
            }))
        }

        state.players.set(msg.userId, {
            id: msg.userId,
            name: msg.name,
            rating: msg.rating,
        })

        await redis.set(`spectator:rating:${msg.userId}`, msg.rating)

        if (isNew) {
            publishOnline(state.players.size)

            let visitorsKey = `spectator:daily-visitors:${date.from(timestamp.now())}`
            let visitorsChanged = await redis.sAdd(visitorsKey, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(visitorsKey))
            }
        }
    })

    postman.on(UserDisconnect83, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            publishOnline(state.players.size)
        }
    })

    postman.on(UserDisconnect107, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            publishOnline(state.players.size)
        }
    })

    postman.on(UserDisconnect108, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            publishOnline(state.players.size)
        }
    })

    postman.on(Room, (msg) => {
        state.rooms.set(msg.hostId, {
            hostId: msg.hostId,
            size: msg.size,
            members: msg.members,
            description: msg.description,
            flags: {
                onRating: msg.onRating,
                isStarted: msg.isStarted,
                hasPassword: msg.hasPassword,
            },
            timestamp: msg.timestamp,
            gameId: msg.gameId,
        })
    })

    postman.on(RoomRemove, (msg) => {
        if (state.rooms.has(msg.hostId)) {
            let room = state.rooms.get(msg.hostId)!

            redis.rPush('events:spectator:room-removed', JSON.stringify({
                gameId: room.gameId,
                players: room.members,
            }))

            state.rooms.delete(msg.hostId)
        }
    })
    
    await client.connect()

    process.on('uncaughtException', async (err: Error) => {
        sendMessage(`${err.message}\n${err.stack}`)
        await client.disconnect()
        await client.connect()
    })
    
    setInterval(() => {
        lobby().insert({
            table: 'online',
            values: [ { online: state.players.size } ],
            format: 'JSONEachRow',
        })
    }, 60_000)

    // let historyAgent = new HistoryAgent(postman)

    // let namesAgent = new NamesAgent(postman)

    // setTimeout(async () => {
    //     let start = Date.now()
    //     // let history = await historyAgent.get(1095408) // Temnotta
    //     let history = await historyAgent.get(1019110)
    //     let diff = Date.now() - start

    //     history.games.forEach(game => {
    //         logger.info(`game #${game.id}: ${game.status}`)
    //     })
    // }, 2000)
}

main()
