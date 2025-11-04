import { formatBytes } from "./bytes";
import { Client, ClientStatistics } from "./client";
import { sendMessage } from "./telegram";


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
    statistics: ClientStatistics,
}

export class Supervisor {
    private clients: Client[] = []
    private states: Map<string, State> = new Map()

    constructor() {
        setInterval(async () => {
            if (this.clients.length === 0) return

            let now = Math.floor(Date.now() / 1000)
    
            let text = `[${process.env.APP_ENV}] clients:\n`

            this.clients.forEach(client => {
                let state = this.states.get(client.name)

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
    }

    public addClient(client: Client): void {
        if (this.clients.find(c => c.name === client.name)) {
            throw new Error(`client ${client.name} already added to supervisor`)
        }

        this.states.set(client.name, { 
            connected: client.isConnected(), 
            log: [],
            statistics: {
                sent: { bytes: 0, messages: 0 },
                received: { bytes: 0, messages: 0 },
            },
        })

        this.clients.push(client)

        client.onConnect(() => {
            this.states.get(client.name).connected = true
            this.states.get(client.name).log.push({
                timestamp: Math.floor(Date.now() / 1000),
                type: EventType.Connected,
                client: client.name,
            })
        })

        client.onDisconnect(() => {
            this.states.get(client.name).connected = false
            this.states.get(client.name).log.push({
                timestamp: Math.floor(Date.now() / 1000),
                type: EventType.Disconnected,
                client: client.name,
            })
        })
    }
}
