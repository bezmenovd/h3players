import { sendMessage } from "./services/telegram"
import { logger } from './services/logger'


export function initWorker() {
    process.on('uncaughtException', (err: Error) => {
        if (err.message === 'authorization failed') {
            sendMessage('authorization failed')
            logger.error(`authorization failed`)
            process.exit(0)
        }
        sendMessage(`${err.message}\n${err.stack}`)
        logger.error(`${err.message}\n${err.stack}`)
        process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
        logger.error(`${reason}: ${promise}`)
        process.exit(1)
    })
}

