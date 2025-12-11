import { update as updateRank, listen as listenRank } from './src/background/rank'
import { logger } from './src/services/logger'
import config from '../../config.json'


async function main() {
    logger.info('starting..')

    if (config.background.rank.enabled) {
        updateRank()
        listenRank()
    }

    
}

main()
