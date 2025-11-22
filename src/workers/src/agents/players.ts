import { Postman } from "../postman";
import { Players } from "../types/msgin";
import { GetPlayers } from "../types/msgout";

export class PlayersAgent {
    private resolve?: (msg: Players) => void
    private reject?: (err: Error) => void
    private errorTimeout: null|NodeJS.Timeout = null

    constructor(
        public postman: Postman
    ) {
        postman.on(Players, (msg) => {
            this.resolve && this.resolve(msg)
        })

        postman.client.onDisconnect(() => {
            this.reject && this.reject(new Error('disconnect'))
            this.cleanup()
        })
    }

    private cleanup() {
        this.errorTimeout && clearTimeout(this.errorTimeout)
        this.resolve = undefined
        this.reject = undefined
    }

    public async get(playerIds: number[]): Promise<Players> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<Players>((resolve, reject) => {
            this.reject = reject
            
            this.errorTimeout = setTimeout(() => {
                this.cleanup()
                reject(new Error('timeout'))
            }, 6000)

            this.resolve = (msg: Players) => {
                this.cleanup()
                resolve(msg)
            }

            this.postman.send(new GetPlayers(playerIds))
        })
    }
}
