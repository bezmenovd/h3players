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


process.env.TZ = 'Europe/Moscow'


process.on('uncaughtException', (err: Error) => {
    sendMessage(`${err.message}\n${err.stack}`)
})


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

    while (true) {
        let result = await namesAgent.get(Array.from({ length: 10 }, (x, k) => k + currentId))

        if (result.total > 0) {
            result.items.forEach(item => buffer.push(item))
    
            currentId = result.items[result.total-1].id + 1

            await sleep(500)
        } else {
            await sleep(60_000)
        }
    }
}

main()
