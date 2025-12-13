import { Client } from './src/client'
import { createState, State } from './src/state'
import { Room, RoomRemove, User51, User52, UserDisconnect107, UserDisconnect108, UserDisconnect83 } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { timestamp, date } from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'
import { Postman } from './src/postman'
import { createClient } from 'redis'
import { debounce } from './src/helpers/functions'
import { initWorker } from './src/worker'
import config from './../../config.json'


async function main() {
    logger.info('starting..')

    if (! config.workers.spectator.enabled) {
        logger.info('disabled by config.json')
        process.exit(0)
        return
    }

    initWorker()

    const USER = String(process.env.USER)
    
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

    const client = new Client('spectator', config.workers.spectator.user)
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    let state: State;

    let updateOnlineInterval
    
    client.onConnect(() => {
        state = createState()
        updateOnlineInterval = setInterval(async () => {
            await lobby().insert({
                table: 'online',
                values: [ { online: getOnline() } ],
                format: 'JSONEachRow',
            })
        }, 15_000)
    })

    client.onDisconnect(() => {
        if (updateOnlineInterval!) {
            clearInterval(updateOnlineInterval)
        }
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

    let lastDay = (new Date()).getDay()

    setInterval(async () => {
        let curDay = (new Date()).getDay()

        if (curDay === lastDay) {
            return
        }

        lastDay = curDay

        let multi = redis.multi()

        for (const [_, player] of state.players) {
            multi.sAdd(`spectator:daily-visitors:${date.from(timestamp.now())}`, String(player.id))
        }

        await multi.exec()

        publishVisitors(await redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`))
    }, 1000)
}

main()
