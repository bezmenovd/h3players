import { logger } from './src/services/logger'
import { createClient } from 'redis'


process.env.TZ = 'Europe/Moscow'


async function main() {
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    redis.connect()


    setInterval(async () => {
        let eventsCount = await redis.lLen('events:spectator:player-rating-changed')
        logger.info(`events: ${eventsCount}`)
    }, 60_000)
}

main()
