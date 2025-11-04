import { bytesToHex, readstr } from "../bytes"


export class Msg {
    public toString(): string {
        let valuesStr = Object.entries(this)
            .filter(([key, value]) => key != 'data')
            .map(([key, value]) => {
                let formatValue = (value: any) => {
                    if (Array.isArray(value)) {
                        return value.map(i => formatValue(i)).join(',')
                    } else if (typeof value === 'string') {
                        return `'${value}'`
                    } else if (value instanceof Buffer) {
                        return `'${bytesToHex(value)}'`
                    } else if (typeof value === 'boolean') {
                        return `${ value ? 'true' : 'false' }`
                    } else if (typeof value === 'number') {
                        return `${value}`
                    }
                }
                return `${key}=${formatValue(value)}`
            })
            .join(' ')

        return `${this.constructor.name} ${valuesStr}`
    }
}

export class MsgIn extends Msg {
    public data: Buffer

    constructor(data: Buffer) {
        super()
        this.data = data
    }
}



export class MultipleSessions extends MsgIn {}


export class User extends MsgIn {
    public userId: number
    public userIdBuffer: Buffer
    public name: string
    public rating: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(4)
        this.userIdBuffer = this.data.subarray(4, 8)
        this.name = readstr(this.data, 16)
        this.rating = this.data.readUint16LE(8)
    }
}


export class UserDisconnect extends MsgIn {
    public userId: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(0)
    }
}


export enum ChatMessageGlobalChat {
    English = 0,
    Russian = 1,
    Polish = 2,
}

export class ChatMessage extends MsgIn {
    public userId: number
    public recepientId: number
    public isPrivate: boolean
    public userName: string
    public text: string

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(0)
        this.recepientId = this.data.readUInt32LE(4)
        this.isPrivate = ! (this.recepientId in ChatMessageGlobalChat)
        this.userName = readstr(this.data, 30)
        this.text = readstr(this.data, 47)
    }
}


export class Room extends MsgIn {
    public hostId: number
    public description: string
    public hasPassword: boolean
    public size: number
    public onRating: boolean
    public members: number[] = []
    public relativeTimestamp: number
    public isStarted: boolean
    public gameId: number

    public constructor(data: Buffer) {
        super(data)
        this.hostId = this.data.readUInt32LE(0)
        this.description = readstr(this.data, 8, 71)
        this.hasPassword = this.data.readUint8(72) === 1
        this.size = this.data.readUInt8(73)
        this.onRating = this.data.readUint8(74) === 1
        
        let membersCount = this.data.readUInt8(80)
        for (let i = 0; i < membersCount; i++) {
            this.members.push(this.data.readUInt32LE(81 + i*4))
        }

        this.relativeTimestamp = this.data.readUInt32LE(113)
        this.isStarted = this.relativeTimestamp != 0
        this.gameId = this.data.readUInt32LE(117)
    }
}


export class RoomUpdate extends MsgIn {
    public hostId: number
    public relativeTimestamp: number
    public isStarted: boolean

    public constructor(data: Buffer) {
        super(data)

        this.hostId = this.data.readUInt32LE(0)
        this.relativeTimestamp = this.data.readUInt32LE(4)
        this.isStarted = this.data.readUInt8(12) === 0
    }
}


export class RoomRemove extends MsgIn {
    public hostId: number
    public relativeTimestamp: number

    public constructor(data: Buffer) {
        super(data)

        this.hostId = this.data.readUInt32LE(0)
        this.relativeTimestamp = this.data.readUInt32LE(4)
    }
}


export const MsgInList : Record<number, new (data: Buffer) => MsgIn> = {
    // 2: MultipleSessions,
    51: User,
    56: Room,
    57: RoomUpdate,
    58: RoomRemove,
    70: ChatMessage,
    71: ChatMessage,
    83: UserDisconnect,
    107: UserDisconnect,
}
