import { logger } from "./logger"

let lastSend : number = 0

export async function sendMessage(text: string) {
    while ((lastSend + 3000) > Date.now()) {
        await new Promise((resolve) => setTimeout(resolve, (lastSend + 3000) - Date.now()))
    }
    lastSend = Date.now()

    let response = await fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage?chat_id=${process.env.TG_CHAT_ID}&text=${encodeURIComponent(text)}`)
    if (response.status !== 200) {
        logger.info(`supervisor error: failed to call telegram sendMessage: ${response.statusText} (${response.url})`)
    }
}
