import { logger } from './src/services/logger'
import { createClient } from 'redis'
import { getHdModVersion } from './src/version'
import { sendMessage } from './src/services/telegram'


async function main() {-
    logger.info('starting..')

    const redis = createClient({
        socket: {
            host: 'redis',
        }
    })

    await redis.connect()

    setInterval(async () => {
        let eventsCount = await redis.lLen('events:spectator:player-updated')
        logger.info(`events:spectator:player-updated: ${eventsCount}`)

        let processorGamesCount = await redis.lLen('processor:games')
        logger.info(`processor:games: ${processorGamesCount}`)

        let processorGamesVCount = await redis.lLen('processor:games_v')
        logger.info(`processor:games_v: ${processorGamesVCount}`)

        let processorPlayersCount = await redis.lLen('processor:players')
        logger.info(`processor:players: ${processorPlayersCount}`)

        let processorTemplatesCount = await redis.lLen('processor:templates')
        logger.info(`processor:templates: ${processorTemplatesCount}`)
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
