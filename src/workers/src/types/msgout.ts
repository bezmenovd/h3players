import { buffer } from "node:stream/consumers"
import { Code, Msg } from "./msg"
import { bytesToHex } from "../helpers/bytes"


export abstract class MsgOut extends Msg {
    abstract toBuffer(): Buffer;
}


@Code(151)
export class GetHistory extends MsgOut {
    constructor(
        public playerId: number,
        public beforeTimestamp: number = 4294967295,
    ) {
        super()
    }
    
    toBuffer(): Buffer {
        let buffer = Buffer.alloc(8)
        buffer.writeUInt32LE(this.playerId, 0)
        buffer.writeUInt32LE(this.beforeTimestamp, 4)

        return buffer
    }
}


@Code(155)
export class GetNames extends MsgOut {
    constructor(
        public playerIds: number[]
    ) {
        super()
    }

    toBuffer(): Buffer {
        let buffer = Buffer.alloc(this.playerIds.length * 4 + 4)

        buffer.writeUInt32LE(this.playerIds.length, 0)

        for (let i = 0; i < this.playerIds.length; i++) {
            buffer.writeUInt32LE(this.playerIds[i], i*4 + 4)
        }

        return buffer
    }
}
