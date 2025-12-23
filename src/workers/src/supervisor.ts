import { formatBytes } from "./helpers/bytes";
import { Client, ClientStatistics } from "./client";
import { sendMessage } from "./services/telegram";
import { timestamp } from "./helpers/timestamp";
import { internal } from "./services/clickhouse";


enum EventType {
    Connected = 0,
    Disconnected = 1,
}

type Event = {
    timestamp: number
    type: EventType
    client: string
}

type State = {
    connected: boolean
    log: Event[],
    lastStatistics: ClientStatistics,
}

export class Supervisor {
    private clients: Client[] = []
    private states: Map<string, State> = new Map()

    constructor() {
        setInterval(async () => {
            if (this.clients.length === 0) return

            let now = timestamp.now()
    
            let text = ``

            this.clients.forEach(client => {
                let state = this.states.get(client.name)!

                let reconnections = state.log.filter(event => {
                    return event.type === EventType.Disconnected && event.timestamp + 3600*24 > now
                })
                
                text += ` - ${client.name} ${ state.connected ? 'connected' : 'disconnected' }`

                if (reconnections.length > 0) {
                    text += ` (${reconnections.length} reconnections in last 24 hours)`
                }

                text += `\n`

                text += `     └ sent ${formatBytes(client.statistics.sent.bytes)} (${client.statistics.sent.messages} messages)\n`
                text += `     └ received ${formatBytes(client.statistics.received.bytes)} (${client.statistics.received.messages} messages)\n`

                text += '\n'
            })

            sendMessage(text)

        }, 60_000*60*12)

        setInterval(async () => {
            let diffs: (ClientStatistics & { client: string })[] = []

            this.clients.forEach(client => {
                let state = this.states.get(client.name)!

                let diff: (ClientStatistics & { client: string }) = {
                    client: client.name,
                    sent: {
                        bytes: client.statistics.sent.bytes - state.lastStatistics.sent.bytes,
                        messages: client.statistics.sent.messages - state.lastStatistics.sent.messages,
                    },
                    received: {
                        bytes: client.statistics.received.bytes - state.lastStatistics.received.bytes,
                        messages: client.statistics.received.messages - state.lastStatistics.received.messages,
                    },
                }

                diffs.push(diff)
                state.lastStatistics.sent.bytes = client.statistics.sent.bytes
                state.lastStatistics.sent.messages = client.statistics.sent.messages
                state.lastStatistics.received.bytes = client.statistics.received.bytes
                state.lastStatistics.received.messages = client.statistics.received.messages
            })

            await internal().insert({
                table: 'statistics',
                values: diffs.map(diff => ({
                    name: diff.client,
                    sent_bytes: diff.sent.bytes,
                    sent_messages: diff.sent.messages,
                    received_bytes: diff.received.bytes,
                    received_messages: diff.received.messages,
                })),
                format: 'JSONEachRow',
            })
        }, 60_000)
    }

    public addClient(client: Client): void {
        if (this.clients.find(c => c.name === client.name)) {
            throw new Error(`client ${client.name} already added to supervisor`)
        }

        this.states.set(client.name, { 
            connected: client.isConnected(), 
            log: [],
            lastStatistics: {
                sent: { bytes: 0, messages: 0 },
                received: { bytes: 0, messages: 0 },
            },
        })

        this.clients.push(client)

        client.onConnect(() => {
            this.states.get(client.name)!.connected = true
            this.states.get(client.name)!.log.push({
                timestamp: timestamp.now(),
                type: EventType.Connected,
                client: client.name,
            })
        })

        client.onDisconnect(() => {
            this.states.get(client.name)!.connected = false
            this.states.get(client.name)!.log.push({
                timestamp: timestamp.now(),
                type: EventType.Disconnected,
                client: client.name,
            })
        })
    }
}
