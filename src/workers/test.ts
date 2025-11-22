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
}

main()
