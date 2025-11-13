import { Client } from "./client";
import { MsgIn } from "./types/msgin";
import { MsgOut } from "./types/msgout";

export class Postman {
    private listeners: Map<number, ((msg: MsgIn) => void)[]> = new Map()
    private msgInList: Map<number, (data: Buffer) => MsgIn> = new Map()

    constructor(
        public client: Client
    ) {
        client.onMessage((data: Buffer) => {
            let code = data.readUInt16LE(0)
            let listeners = this.listeners.get(code)

            if (listeners) {
                let msg = this.msgInList.get(code)!(data.subarray(2))
                listeners.forEach(l => l(msg))
            }
        })
    }

    public on<T extends MsgIn>(
        type: (new (...args: any[]) => T) & { code: number }, 
        listener: (msg: T) => void
    ): void {
        if (! this.listeners.get(type.code)) {
            this.listeners.set(type.code, [])
            this.msgInList.set(type.code, (data: Buffer) => new type(data))
        }

        this.listeners.get(type.code)!.push(listener as (msg: MsgIn) => {})
    }

    public send(msg: MsgOut): void {
        let msgBuffer = msg.toBuffer()
        let buffer = Buffer.alloc(msgBuffer.length + 2)
        buffer.writeUInt16LE(msg.getCode())
        msgBuffer.copy(buffer, 2)

        this.client.writeWL(buffer)
    }
}
