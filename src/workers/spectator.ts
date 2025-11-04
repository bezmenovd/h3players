import { Client } from './src/client'
import config from './config'
import { createState, State } from './src/state'
import { bytesToHex, formatBytes, hexDump } from './src/bytes'
import fs from 'node:fs'
import { ChatMessage, MsgInList, Room, RoomRemove, RoomUpdate, User, UserDisconnect } from './src/types/msgin'
import { logger } from './src/logger'
import { Supervisor } from './src/supervisor'
import dotenv from 'dotenv'
import { sendMessage } from './src/telegram'


process.env.TZ = 'Europe/Moscow'

dotenv.config({ quiet: true })


process.on('uncaughtException', (err: Error) => {
    sendMessage(`${err.message}\n${err.stack}`)
})


const supervisor = new Supervisor()



const spectator = new Client('spectator', 'h3players_bot1')

supervisor.addClient(spectator)


let state: State | undefined;

spectator.onConnect(() => {
    state = createState()
})

spectator.onDisconnect(() => {
    state = undefined
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
        }
        if (message instanceof UserDisconnect) {
            if (! state.players.has(message.userId)) {
                return
            }

            // logger.info(`user#${message.userId}: ${state.players.get(message.userId).name} disconnected`)

            state.players.delete(message.userId)
        }
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
                let players = state.rooms.get(message.hostId).members.map(memberId => state.players.get(memberId)?.name ?? memberId)

                // logger.info(`user#${message.hostId}: ${state.players.get(message.hostId).name} room '${state.rooms.get(message.hostId).description}' started with members ${players.join(', ')}`)

                state.rooms.get(message.hostId).relativeTimestamp = message.relativeTimestamp
                state.rooms.get(message.hostId).flags.isStarted = message.isStarted
            }
        }
        if (message instanceof RoomRemove) {
            if (! state.rooms.has(message.hostId)) {
                return
            }

            let players = state.rooms.get(message.hostId).members.map(memberId => state.players.get(memberId)?.name ?? memberId)

            // logger.info(`room of ${ players.join(', ') } removed (game end)`)

            state.rooms.delete(message.hostId)
        }
        if (message instanceof ChatMessage) {
            if (message.isPrivate) {
                // logger.info(`new private message from user#${message.userId} ${message.userName}: '${message.text}'`)
            }
            throw new Error('test')
        }
    }
})

await spectator.connect()

