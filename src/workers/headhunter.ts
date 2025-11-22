import { Client } from './src/client'
import { bytesToHex, formatBytes, hexDump } from './src/helpers/bytes'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import { Postman } from './src/postman'
import { NamesAgent } from './src/agents/names'
import { createClient } from 'redis'
import { sleep } from './src/helpers/sleep'
import { lobby } from './src/services/clickhouse'
import { Names } from './src/types/msgin'


process.env.TZ = 'Europe/Moscow'


async function main() {
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    redis.connect()

    let startIdCache = await redis.get('headhunter:startId')
    let startId = startIdCache ? Number(startIdCache) : 1

    logger.info(`startId: ${startId}`)

    const client = new Client('headhunter', 'h3players_bot2')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    await client.connect()

    process.on('uncaughtException', async (err: Error) => {
        sendMessage(`${err.message}\n${err.stack}`)
        await client.disconnect()
        await client.connect()
    })

    let namesAgent = new NamesAgent(postman)
    let currentId = startId
    let buffer: { id: number, name: string }[] = []

    setInterval(() => {
        logger.info(`currentId: ${currentId}`)
    }, 60_000)

    setInterval(async () => {
        if (buffer.length === 0) {
            return
        }

        const bufferCopy = buffer
        buffer = []

        lobby().insert({
            table: 'players',
            values: [ bufferCopy ],
            format: 'JSONEachRow',
        })

        await redis.set('headhunter:startId', currentId)
    }, 30_000)


    async function findExisting(ids: number[]): Promise<number[]> {
        if (ids.length === 0) return [];

        try {
            await sleep(100)
            let res = await namesAgent.get(ids);
            return res.items.map(i => i.id);
        } catch {
            if (ids.length === 1) {
                return [];
            }
            const mid = Math.floor(ids.length / 2);
            const left = await findExisting(ids.slice(0, mid));
            const right = await findExisting(ids.slice(mid));
            return [...left, ...right];
        }
    }

    while (true) {
        if (! client.isConnected()) {
            logger.info('is not connected, sleeping')
            await sleep(10_000)
            continue
        }

        let result: Names|null = null
        let nextIds = Array.from({ length: 10 }, (x, k) => k + currentId)

        try {
            result = await namesAgent.get(nextIds)
        } catch (e: any) {
            if (! client.isConnected()) {
                logger.info('error caused by disconnect')
                continue
            }
            if (e.message !== 'timeout') {
                throw e
            }

            let existingIds = await findExisting(nextIds)

            logger.info(`non-existing ids: ${nextIds.filter(id => ! existingIds.includes(id)).join(',')}`)

            if (existingIds.length === 0) {
                currentId += 10
                continue
            }

            result = await namesAgent.get(existingIds)
        }

        result = result!

        if (result.total > 0) {
            result.items.forEach(item => buffer.push(item))

            currentId = result.items[result.total-1].id + 1

            await sleep(1000)
        } else {
            await sleep(60_000)
        }
    }
}

main()
