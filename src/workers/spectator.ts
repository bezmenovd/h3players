import { Client } from './src/client'
import { createState, State } from './src/state'
import { bytesToHex, formatBytes, hexDump } from './src/helpers/bytes'
import fs from 'node:fs'
import { GamesHistory, Room, RoomRemove, RoomUpdate, User, UserDisconnect } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import timestamp from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'
import { Postman } from './src/postman'
import { GetGamesHistory } from './src/types/msgout'
import config from './config'
import { HistoryAgent } from './src/agents/history'


process.env.TZ = 'Europe/Moscow'


process.on('uncaughtException', (err: Error) => {
    sendMessage(`${err.message}\n${err.stack}`)
})


async function main() {
    logger.info('starting..')

    const client = new Client('spectator', 'h3players_bot1')
    const postman = new Postman(client)
    
    const supervisor = new Supervisor()
    supervisor.addClient(client)
    
    let state: State;
    
    client.onConnect(() => {
        state = createState()
    })
    
    let counter = 0
    
    client.onMessage((data: Buffer) => {
        counter++

        let code = data.readUInt16LE(0)
        let buffer = data.subarray(2)
        
        fs.mkdir(`output/server/${code}`, { recursive: true }, () => {})
        fs.writeFile(`output/server/${code}/${counter}`, hexDump(buffer), () => {})
    })

    postman.on(User, (msg) => {
        if (! state.players.has(msg.userId)) {
            // logger.info(`user#${msg.userId}: ${msg.name} (rating=${msg.rating}) connected`)
        }

        state.players.set(msg.userId, {
            id: msg.userId,
            name: msg.name,
            rating: msg.rating
        })
        state.lastUpdate = timestamp.now()
    })

    postman.on(UserDisconnect, (msg) => {
        if (! state.players.has(msg.userId)) {
            return
        }

        // logger.info(`user#${msg.userId}: ${state.players.get(msg.userId)?.name} disconnected`)

        state.players.delete(msg.userId)
        state.lastUpdate = timestamp.now()
    })

    // if (message instanceof RoomRemove) {
    //     if (! state.rooms.has(message.hostId)) {
    //         return
    //     }

    //     let room = state.rooms.get(message.hostId)

    //     if (room) {
    //         // let players = room.members.map(memberId => state.players.get(memberId)?.name ?? memberId)

    //         // logger.info(`room of ${ players.join(', ') } removed (game end)`)

    //         state.rooms.delete(message.hostId)
    //     }
    // }
    // if (message instanceof ChatMessage) {
    //     if (message.isPrivate) {
    //         // logger.info(`new private message from user#${message.userId} ${message.userName}: '${message.text}'`)
    //     }
    // }
    
    setInterval(() => {
        if (! state.lastUpdate || state.lastUpdate > timestamp.now() - 60) {
            lobby().insert({
                table: 'online',
                values: [ { online: state.players.size } ],
                format: 'JSONEachRow',
            })
        }
    }, 60_000)
    
    await client.connect()

    setTimeout(async () => {
        let historyAgent = new HistoryAgent(postman)
        let start = Date.now()
        let history = await historyAgent.get(1095408)
        let diff = Date.now() - start

        logger.info(`got history: ${diff}ms`)
    }, 2000)
}

main()
