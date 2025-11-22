import { bytesToHex, readstr } from "../helpers/bytes"
import { Code, Msg } from "./msg"


export abstract class MsgIn extends Msg {
    constructor(
        public data: Buffer
    ) {
        super()
    }

    public toString(): string {
        let valuesStr = Object.entries(this)
            .filter(([key, value]) => key != 'data')
            .map(([key, value]) => {
                let formatValue = (value: any): string => {
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
                    return JSON.stringify(value)
                }
                return `${key}=${formatValue(value)}`
            })
            .join(' ')

        return `${this.constructor.name} ${valuesStr}`
    }
}


@Code(2)
export class MultipleSessions extends MsgIn {}


@Code(51)
export class User51 extends MsgIn {
    public userId: number
    public userIdBuffer: Buffer
    public name: string
    public rating: number
    public flag: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(4)
        this.userIdBuffer = this.data.subarray(4, 8)
        this.name = readstr(this.data, 16)
        this.rating = this.data.readUint16LE(8)
        this.flag = this.data.readUInt8(38)
    }
}


@Code(52)
export class User52 extends MsgIn {
    public userId: number
    public userIdBuffer: Buffer
    public name: string
    public rating: number
    public flag: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(4)
        this.userIdBuffer = this.data.subarray(4, 8)
        this.name = readstr(this.data, 16)
        this.rating = this.data.readUint16LE(8)
        this.flag = this.data.readUInt8(38)
    }
}


@Code(83)
export class UserDisconnect83 extends MsgIn {
    public userId: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(0)
    }
}


@Code(107)
export class UserDisconnect107 extends MsgIn {
    public userId: number

    public constructor(data: Buffer) {
        super(data)
        this.userId = this.data.readUInt32LE(0)
    }
}


@Code(108)
export class UserDisconnect108 extends MsgIn {
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

@Code(70)
export class ChatMessage70 extends MsgIn {
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

@Code(71)
export class ChatMessage71 extends ChatMessage70 {}


@Code(56)
export class Room extends MsgIn {
    public hostId: number
    public description: string
    public hasPassword: boolean
    public size: number
    public onRating: boolean
    public members: number[] = []
    public timestamp: number
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

        this.timestamp = this.data.readUInt32LE(113)
        this.isStarted = this.timestamp != 0
        this.gameId = this.data.readUInt32LE(117)
    }
}


@Code(57)
export class RoomUpdate extends MsgIn {
    public hostId: number
    public timestamp: number
    public isStarted: boolean

    public constructor(data: Buffer) {
        super(data)

        this.hostId = this.data.readUInt32LE(0)
        this.timestamp = this.data.readUInt32LE(4)
        this.isStarted = this.data.readUInt8(12) === 0
    }
}


@Code(58)
export class RoomRemove extends MsgIn {
    public hostId: number
    public timestamp: number

    public constructor(data: Buffer) {
        super(data)

        this.hostId = this.data.readUInt32LE(0)
        this.timestamp = this.data.readUInt32LE(4)
    }
}


export enum GameStatus {
    HostWon = 2,
    Draw = 4,
    OpponentWon = 8,
    NotFinished = 1,
}

export enum GameType {
    Scenario,
    RandomMap,
}

export enum GamePlayerColor {
    Red = 0,
    Blue = 1,
    Tan = 2,
    Green = 3,
    Orange = 4,
    Violet = 5,
    Cyan = 6,
    Pink = 7,
}

export enum GamePlayerTown {
    Castle = 0,
    Rampart = 1,
    Tower = 2,
    Inferno = 3,
    Necropolis = 4,
    Dungeon = 5,
    Stronghold = 6,
    Fortress = 7,
    Conflux = 8,
    Cove = 9,
    Factory = 10,
}

export class Game {
    public id: number
    public templateId: number

    public size: number
    public levels: number
    
    public status: GameStatus

    public restarts: number
    public endDay: number

    public startTimestamp: number
    public endTimestamp: number

    public hostId: number
    public hostColor: GamePlayerColor
    public hostTown: GamePlayerTown
    public hostHero: number
    public hostOldRating: number
    public hostNewRating: number

    public opponentId: number
    public opponentColor: GamePlayerColor
    public opponentTown: GamePlayerTown
    public opponentHero: number
    public opponentOldRating: number
    public opponentNewRating: number

    constructor(data: Buffer) {
        this.id = data.readUInt32LE(0)
        this.templateId = data.readUInt32LE(4)

        this.size = data.readUInt8(9)
        this.levels = data.readUInt8(10)
        this.status = data.readUInt8(11)

        this.restarts = Math.max(data.readUInt8(13) - 1, 0)

        this.endDay = data.readUInt16LE(15)

        this.startTimestamp = data.readUInt32LE(19)
        this.endTimestamp = data.readUInt32LE(23)

        this.hostId = data.readUInt32LE(27)
        this.hostColor = data.readUInt8(31)
        this.hostTown = data.readUInt8(38)
        this.hostHero = data.readUInt8(39)
        this.hostOldRating = data.readUInt32LE(65)
        this.hostNewRating = data.readUInt32LE(69)

        this.opponentId = data.readUInt32LE(73)
        this.opponentColor = data.readUInt8(77)
        this.opponentTown = data.readUInt8(84)
        this.opponentHero = data.readUInt8(85)
        this.opponentOldRating = data.readUInt32LE(111)
        this.opponentNewRating = data.readUInt32LE(115)
    }

    public type(): GameType {
        if (this.templateId == 1) {
            return GameType.Scenario
        }
        return GameType.RandomMap
    }
}

@Code(152)
export class History extends MsgIn {
    public total: number
    public onPage: number
    public games: Game[] = []

    public constructor(data: Buffer) {
        super(data)

        this.total = this.data.readUInt32LE(0)
        this.onPage = this.data.readUInt16LE(4)

        let gameOffset = 12;

        for (let i = 0; i < this.onPage; i++) {
            this.games.push(new Game(this.data.subarray(gameOffset, gameOffset+119)))
            gameOffset += 119
        }
    }
}


export type NamesItem = {
    id: number
    name: string
}

@Code(156)
export class Names extends MsgIn {
    public total: number
    public items: NamesItem[] = []

    public constructor(data: Buffer) {
        super(data)

        this.total = this.data.readUInt32LE(0)

        let offset = 4

        for (let i = 0; i < this.total; i++) {
            this.items.push({
                id: this.data.readUInt32LE(offset),
                name: readstr(this.data, offset + 4 + 2, 16)
            })

            offset += 23
        }
    }
}
