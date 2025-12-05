import { logger } from "./logger"

let lastSend : number = 0

export async function sendMessage(text: string) {
    while ((lastSend + 3000) > Date.now()) {
        await new Promise((resolve) => setTimeout(resolve, (lastSend + 3000) - Date.now()))
    }
    lastSend = Date.now()

    let response = await fetch(`https://api.telegram.org/bot8558838967:AAF7tqVj7KrTRclY_brvhxJXfX8xsO7gdnU/sendMessage?chat_id=-1003281093075&text=${encodeURIComponent(text)}`)
    if (response.status !== 200) {
        logger.info(`failed to call telegram sendMessage: ${response.statusText} (${response.url})`)
    }
}
