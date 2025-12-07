import { rankInit, rankListen } from './src/background/rank'
import { logger } from './src/services/logger'
import { createClient } from 'redis'
import config from '../../config.json'


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

    if (config.background.rank.init) {
        rankInit(redis)
    }
    if (config.background.rank.listen) {
        rankListen(redis, redisSub)
    }

    
}

main()
