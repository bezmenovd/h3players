import { Postman } from "../postman";
import { History } from "../types/msgin";
import { GetHistory } from "../types/msgout";

export class HistoryAgent {
    private resolve?: (msg: History) => void
    private reject?: () => void

    constructor(
        public postman: Postman
    ) {
        postman.on(History, (msg) => {
            this.resolve && this.resolve(msg)
        })

        postman.client.onDisconnect(() => {
            this.reject && this.reject()
            this.resolve = undefined
            this.reject = undefined
        })
    }

    public async get(playerId: number, beforeTimestamp?: number): Promise<History> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<History>((resolve, reject) => {
            this.reject = reject
                        
            let errorTimeout =  setTimeout(() => { 
                this.resolve = undefined
                this.reject = undefined
                reject()
            }, 6000)

            this.resolve = (msg: History) => {
                clearTimeout(errorTimeout)
                this.reject = undefined
                this.resolve = undefined
                resolve(msg)
            }

            this.postman.send(new GetHistory(playerId, beforeTimestamp))
        })
    }
}
