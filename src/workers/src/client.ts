import net, { Socket } from 'net'
import { logger } from './logger';
import { bytesToHex, hexDump } from './bytes';
import config from '../config';

export type Listener = (data: Buffer) => void;

export type ClientStatistics = {
    sent: {
        bytes: number
        messages: number
    }
    received: {
        bytes: number
        messages: number
    }
}

export class Client {
    private authstr?: string
    private socket?: Socket
    private connected: boolean = false

    private listenersOnMessage: Listener[] = []
    private listenersOnConnect: Function[] = []
    private listenersOnDisconnect: Function[] = []

    private msgBuffer: Buffer = Buffer.alloc(1024*64, 0)
    private msgLen: number = 0
    private msgLenBuffer: Buffer = Buffer.alloc(2, 0)
    private msgLenBufferLen: number = 0
    private msgLenExpected: number = 0

    public statistics: ClientStatistics = {
        sent: { bytes: 0, messages: 0 },
        received: { bytes: 0, messages: 0 },
    }

    constructor(
        public name: string,
        public user: string,
    ) {
        this.authstr = config.users.find(u => u.name === user)?.authstr

        if (! this.authstr) {
            throw new Error(`no such user: ${user}`)
        }
    }

    public async connect(): Promise<void> {
        if (this.connected) {
            throw new Error('already connected');
        }
        if (this.listenersOnMessage.length === 0) {
            throw new Error("no onMessage listeners")
        }

        return new Promise((resolve) => {
            this.socket = net.createConnection({
                host: config.server.ip,
                port: config.server.port,
                timeout: config.connection.timeout,
            })
    
            this.socket.on('connect', () => {
                this.write(Buffer.from(this.authstr, 'hex'), false)
            })

            this.socket.on('data', (data: Buffer) => {
                if (this.connected) {
                    this.onData(data)
                } else {
                    this.connected = true
                    logger.info(`client(${this.name}) connected as ${this.user}`)
                    this.listenersOnConnect.forEach(l => l())
                    resolve()
                }
            })

            this.socket.on('error', (err: Error) => this.onError(err))
            this.socket.on('timeout', () => this.onTimeout())
            this.socket.on('close', () => this.onClose())
        })
    }

    public disconnect(): void {
        if (! this.connected) {
            return
        }

        this.socket.destroy()
        this.socket.removeAllListeners('data')

        this.msgLen = 0
        this.msgLenBufferLen = 0
        this.msgLenExpected = 0
    }

    public isConnected(): boolean {
        return this.connected
    }

    public onMessage(listener: Listener): void {
        this.listenersOnMessage.push(listener)
    }

    public onConnect(listener: Function): void {
        this.listenersOnConnect.push(listener)
    }

    public onDisconnect(listener: Function): void {
        this.listenersOnDisconnect.push(listener)
    }

    public write(buffer: Buffer, check: boolean = true): void {
        if (check && ! this.connected) {
            throw new Error('not connected')
        }

        this.socket.write(buffer)

        this.statistics.sent.bytes += buffer.length
        this.statistics.sent.messages++

        // logger.info(`client(${this.name}) wrote ${buffer.length} bytes`)
    }

    public writeWL(buffer: Buffer, check: boolean = true): void {
        if (check && ! this.connected) {
            throw new Error('not connected')
        }

        const bufferWL = Buffer.alloc(2 + buffer.length);
        bufferWL.writeUInt16LE(buffer.length+2, 0);
        buffer.copy(bufferWL, 2);

        this.socket.write(bufferWL)

        this.statistics.sent.bytes += bufferWL.length
        this.statistics.sent.messages++

        // logger.info(`client(${this.name}) wrote ${bufferWL.length} bytes`)
    }

    private onData(data: Buffer): void {
        // logger.info(`client(${this.name}) read ${data.length} bytes`)

        // hexDump(data.subarray(0, 16))

        this.statistics.received.bytes += data.length

        let dataOffset = 0;

        while (dataOffset < data.length) {
            if (this.msgLenExpected === 0) { // no current message
                
                let remaining = 2 - this.msgLenBufferLen
                let toCopy = Math.min(data.length-dataOffset, remaining)
                
                data.copy(this.msgLenBuffer, this.msgLenBufferLen, dataOffset, dataOffset+toCopy)
                this.msgLenBufferLen += toCopy
                
                if (this.msgLenBufferLen === 2) {
                    // logger.info(`client(${this.name}) length bytes: ${bytesToHex(this.msgLenBuffer)}`)
                    this.msgLenExpected = this.msgLenBuffer.readUInt16LE(0)
                    this.msgLenBufferLen = 0
                    this.msgLen = 2
                }

                dataOffset += toCopy

                // logger.info(`client(${this.name}) waiting for message of length=${this.msgLenExpected} (now=${this.msgLen})`)
            } else {
                let remaining = this.msgLenExpected - this.msgLen
                let toCopy = Math.min(data.length-dataOffset, remaining)
    
                data.copy(this.msgBuffer, this.msgLen, dataOffset, dataOffset+toCopy)
                this.msgLen += toCopy

                // logger.info(`client(${this.name}) toCopy=${toCopy} remaining=${remaining}`)
    
                if (this.msgLen === this.msgLenExpected) {
                    this.statistics.received.messages++
                    this.listenersOnMessage.forEach(l => l(this.msgBuffer.subarray(2, this.msgLen)))
                    this.msgLen = 0
                    this.msgLenExpected = 0
                }
                
                dataOffset += toCopy
            }
        }
    }

    private onError(err: Error): void {
        logger.info(`client(${this.name}) error: ${err.message}`)
        
        this.disconnect()
    }

    private onTimeout(): void {
        logger.info(`client(${this.name}) timeout`)

        this.disconnect()
    }

    private onClose(): void {
        let wasConnected = this.connected

        this.socket.removeAllListeners()
        this.socket = undefined

        if (wasConnected) {
            this.connected = false
            this.listenersOnDisconnect.forEach(l => l())
            logger.info(`client(${this.name}) disconnected from ${config.server.ip}:${config.server.port}`)
        }

        if (config.connection.reconnect) {
            logger.info(`client(${this.name}) trying to reconnect..`)
            this.connect()
        }
    }
}
