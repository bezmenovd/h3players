import { Code, Msg } from "./msg"


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
