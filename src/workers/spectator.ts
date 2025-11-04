import { Client } from './src/client'
import config from './config'
import { createState, State } from './src/state'
import { bytesToHex, formatBytes, hexDump } from './src/helpers/bytes'
import fs from 'node:fs'
import { ChatMessage, MsgInList, Room, RoomRemove, RoomUpdate, User, UserDisconnect } from './src/types/msgin'
import { logger } from './src/services/logger'
import { Supervisor } from './src/supervisor'
import { sendMessage } from './src/services/telegram'
import timestamp from './src/helpers/timestamp'
import { lobby } from './src/services/clickhouse'


process.env.TZ = 'Europe/Moscow'


process.on('uncaughtException', (err: Error) => {
    sendMessage(`${err.message}\n${err.stack}`)
})


async function main() {
    const supervisor = new Supervisor()


    const spectator = new Client('spectator', 'h3players_bot1')
    
    supervisor.addClient(spectator)
    
    
    let state: State;
    
    spectator.onConnect(() => {
        state = createState()
    })
    
    // let counter = 0
    
    spectator.onMessage((msg: Buffer) => {
        // counter++
    
        let code = msg.readUInt16LE(0)
        let buffer = msg.subarray(2)
        
        // fs.mkdir(`docs/server/${code}`, () => {})
        // fs.writeFile(`docs/server/${code}/${counter}`, hexDump(buffer), () => {})
    
        if (code in MsgInList) {
            let message = new MsgInList[code](buffer)
    
            if (message instanceof User) {
                if (! state.players.has(message.userId)) {
                    // logger.info(`user#${message.userId}: ${message.name} (rating=${message.rating}) connected`)
                }
    
                state.players.set(message.userId, {
                    id: message.userId,
                    name: message.name,
                    rating: message.rating
                })
                state.lastUpdate = timestamp.now()
            }
            if (message instanceof UserDisconnect) {
                if (! state.players.has(message.userId)) {
                    return
                }
    
                // logger.info(`user#${message.userId}: ${state.players.get(message.userId).name} disconnected`)
    
                state.players.delete(message.userId)
                state.lastUpdate = timestamp.now()
            }
            /*
            if (message instanceof Room) {
                if (state.rooms.has(message.hostId)) {
                    return
                }
                if (! state.players.has(message.hostId)) {
                    return
                }
    
                // logger.info(`user#${message.hostId}: ${state.players.get(message.hostId).name} added room '${message.description}'`)
    
                state.rooms.set(message.hostId, {
                    hostId: message.hostId,
                    description: message.description,
                    members: message.members,
                    size: message.size,
                    flags: {
                        onRating: message.onRating,
                        isStarted: message.isStarted,
                        hasPassword: message.hasPassword,
                    }
                })
            }
            if (message instanceof RoomUpdate) {
                if (! state.rooms.has(message.hostId)) {
                    return
                }
                if (message.isStarted) {
                    let room = state.rooms.get(message.hostId)
                    
                    if (room) {
                        // let players = room.members.map(memberId => state.players.get(memberId)?.name ?? memberId)
        
                        // logger.info(`user#${message.hostId}: ${state.players.get(message.hostId).name} room '${state.rooms.get(message.hostId).description}' started with members ${players.join(', ')}`)
    
                        room.relativeTimestamp = message.relativeTimestamp
                        room.flags.isStarted = message.isStarted
                    }
                }
            }
            if (message instanceof RoomRemove) {
                if (! state.rooms.has(message.hostId)) {
                    return
                }
    
                let room = state.rooms.get(message.hostId)
    
                if (room) {
                    // let players = room.members.map(memberId => state.players.get(memberId)?.name ?? memberId)
        
                    // logger.info(`room of ${ players.join(', ') } removed (game end)`)
        
                    state.rooms.delete(message.hostId)
                }
            }
            if (message instanceof ChatMessage) {
                if (message.isPrivate) {
                    // logger.info(`new private message from user#${message.userId} ${message.userName}: '${message.text}'`)
                }
            }
            */
        }
    })
    
    setInterval(() => {
        if (! state.lastUpdate || state.lastUpdate > timestamp.now() - 60) {
            lobby().insert({
                table: 'online',
                values: [ { online: state.players.size } ],
                format: 'JSONEachRow',
            })
        }
    }, 60_000)
    
    await spectator.connect()
}

main()

