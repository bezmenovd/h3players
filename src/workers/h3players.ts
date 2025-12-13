import { Client } from './src/client'
import { ChatMessage70, ChatMessage71 } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { Postman } from './src/postman'
import { createClient } from 'redis'
import { initWorker } from './src/worker'
import config from '../../config.json'


async function main() {
    logger.info('starting..')

    if (! config.workers.h3players.enabled) {
        logger.info('disabled by config.json')
        process.exit(0)
        return
    }

    initWorker()

    const redisPub = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redisPub.connect()

    const client = new Client('spectator', 'h3players')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)

    let playerCounter: { [key: number]: number } = {}

    setInterval(() => {
        playerCounter = {}
    }, 600_000)

    postman.on(ChatMessage70, async (msg) => {
        if (msg.recepientId < 3) return

        if (playerCounter[msg.userId] === undefined) {
            playerCounter[msg.userId] = 0
        }
        playerCounter[msg.userId]++

        if (playerCounter[msg.userId] > 10) {
            return
        }

        if (! /^\d{6}$/.test(msg.text)) {
            return
        }

        redisPub.publish('h3players:message', JSON.stringify({ playerId: msg.userId, message: msg.text }))
    })

    postman.on(ChatMessage71, async (msg) => {
        if (msg.recepientId < 3) return

        if (playerCounter[msg.userId] === undefined) {
            playerCounter[msg.userId] = 0
        }
        playerCounter[msg.userId]++

        if (playerCounter[msg.userId] > 10) {
            return
        }

        if (! /^\d{6}$/.test(msg.text)) {
            return
        }

        redisPub.publish('h3players:message', JSON.stringify({ playerId: msg.userId, message: msg.text }))
    })
    
    await client.connect()
}

main()
