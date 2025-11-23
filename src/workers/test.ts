import { HistoryAgent } from './src/agents/history'
import { Client } from './src/client'
import { Postman } from './src/postman'
import { logger } from './src/services/logger'
import { createClient } from 'redis'


async function main() {-
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    redis.connect()
    
    const client = new Client('test', 'h3players_bot9')
    const postman = new Postman(client)

    await client.connect()

    let history = await (new HistoryAgent(postman)).get(448)

    console.log(JSON.stringify(history.games.map(g => ({id: g.id, status: g.status, host: g.hostId, opp: g.opponentId}))))
}

main()
