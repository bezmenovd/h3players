import { Postman } from "../postman";
import { History } from "../types/msgin";
import { GetHistory } from "../types/msgout";

export class HistoryAgent {
    private resolve?: (msg: History) => void
    private reject?: (err: Error) => void
    private errorTimeout: null|NodeJS.Timeout = null

    constructor(
        public postman: Postman
    ) {
        postman.on(History, (msg) => {
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

    public async get(playerId: number, beforeTimestamp?: number): Promise<History> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<History>((resolve, reject) => {
            this.reject = reject
            
            this.errorTimeout = setTimeout(() => {
                this.cleanup()
                reject(new Error('timeout'))
            }, 30000)

            this.resolve = (msg: History) => {
                this.cleanup()
                resolve(msg)
            }

            this.postman.send(new GetHistory(playerId, beforeTimestamp))
        })
    }
}
