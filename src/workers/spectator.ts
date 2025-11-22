import { Client } from './src/client'
import { createState, State } from './src/state'
import { bytesToHex, formatBytes, hexDump, intToBytes } from './src/helpers/bytes'
import fs from 'node:fs'
import { Room, RoomRemove, User51, User52, UserDisconnect107, UserDisconnect108, UserDisconnect83 } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import { timestamp, date } from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'
import { Postman } from './src/postman'
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

    const redisPub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisPub.connect()

    const client = new Client('spectator', 'h3players_bot1')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    let state: State;
    
    client.onConnect(() => {
        state = createState()
    })

    const getOnline = () => {
        return state.players.size - state.hiddenPlayers.size
    }

    const publishOnline = debounce(async () => {
        await redisPub.publish('live:spectator:online', JSON.stringify({ value: getOnline() }))
    }, 100)

    const publishVisitors = debounce(async (value: number) => {
        await redisPub.publish('live:spectator:visitors', JSON.stringify({ value }))
    }, 100)
    
    let counter = 0
    
    client.onMessage(async (data: Buffer) => {
        counter++

        let code = data.readUInt16LE(0)
        // let buffer = data.subarray(2)

        if (code > 255) {
            logger.info(`bad message`)
            await client.disconnect()
            await client.connect()
        }
        
        // fs.mkdir(`output/server/${code}`, { recursive: true }, () => {})
        // fs.writeFile(`output/server/${code}/${counter}`, hexDump(buffer), () => {})
    })

    postman.on(User51, async (msg) => {
        let isNew = false

        if (! state.players.has(msg.userId)) {
            isNew = true
        }

        let rating = Number(await redis.get(`spectator:rating:${msg.userId}`))
        if (! Number.isFinite(rating)) {
            rating = -1
        }

        if (rating != msg.rating) {
            redis.rPush('events:spectator:player-updated', JSON.stringify({ playerId: msg.userId }))
        }

        state.players.set(msg.userId, {
            id: msg.userId,
            name: msg.name,
            rating: msg.rating,
            flag: msg.flag,
        })

        if (msg.flag === 4) {
            state.hiddenPlayers.delete(msg.userId)
        } else {
            state.hiddenPlayers.add(msg.userId)
        }

        await redis.set(`spectator:rating:${msg.userId}`, msg.rating, { EX: 86400*30 })

        if (isNew) {
            publishOnline()

            let visitorsChanged = await redis.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
            }
        }
    })

    postman.on(User52, async (msg) => {
        let isNew = false

        if (! state.players.has(msg.userId)) {
            isNew = true
        }

        let rating = Number(await redis.get(`spectator:rating:${msg.userId}`))
        if (! Number.isFinite(rating)) {
            rating = -1
        }

        if (rating != msg.rating) {
            redis.rPush('events:spectator:player-updated', JSON.stringify({ playerId: msg.userId }))
        }

        state.players.set(msg.userId, {
            id: msg.userId,
            name: msg.name,
            rating: msg.rating,
            flag: msg.flag,
        })

        if (msg.flag === 4) {
            state.hiddenPlayers.delete(msg.userId)
        } else {
            state.hiddenPlayers.add(msg.userId)
        }

        await redis.set(`spectator:rating:${msg.userId}`, msg.rating, { EX: 86400*30 })

        if (isNew) {
            publishOnline()

            let visitorsChanged = await redis.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
            }
        }
    })

    postman.on(UserDisconnect83, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            state.hiddenPlayers.delete(msg.userId)
            publishOnline()

            let visitorsChanged = await redis.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
            }
        }
    })

    postman.on(UserDisconnect107, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            state.hiddenPlayers.delete(msg.userId)
            publishOnline()

            let visitorsChanged = await redis.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
            }
        }
    })

    postman.on(UserDisconnect108, async (msg) => {
        if (state.players.has(msg.userId)) {
            state.players.delete(msg.userId)
            state.hiddenPlayers.delete(msg.userId)
            publishOnline()

            let visitorsChanged = await redis.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(msg.userId))
            if (visitorsChanged > 0) {
                publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
            }
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

    postman.on(RoomRemove, async (msg) => {
        if (state.rooms.has(msg.hostId)) {
            let room = state.rooms.get(msg.hostId)!

            redis.rPush('events:spectator:player-updated', JSON.stringify({ playerId: room.members[0] }))

            state.rooms.delete(msg.hostId)
        }
    })
    
    await client.connect()

    process.on('uncaughtException', async (err: Error) => {
        sendMessage(`${err.message}\n${err.stack}`)
        await client.disconnect()
        await client.connect()
    })
    
    setInterval(async () => {
        await lobby().insert({
            table: 'online',
            values: [ { online: getOnline() } ],
            format: 'JSONEachRow',
        })
    }, 60_000)
}

main()
