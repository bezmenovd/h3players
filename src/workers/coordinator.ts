import { logger } from './src/services/logger'
import { createClient } from 'redis'
import { getHdModVersion } from './src/version'
import { sendMessage } from './src/services/telegram'


process.env.TZ = 'Europe/Moscow'


async function main() {-
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    redis.connect()

    setInterval(async () => {
        let eventsCount = await redis.lLen('events:spectator:player-updated')
        logger.info(`events:spectator:player-updated: ${eventsCount}`)
    }, 60_000)

    setInterval(async () => {
        let lastVersion = Number(await redis.get('coordinator:last-hdmod-version'))
        let curVersion = await getHdModVersion()

        if (lastVersion && lastVersion != curVersion) {
            sendMessage(`HD Mod Updated: ${lastVersion} -> ${curVersion}`)
        }

        await redis.set('coordinator:last-hdmod-version', curVersion)
    }, 60_000*10)
}

main()
