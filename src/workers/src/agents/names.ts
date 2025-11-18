import { Postman } from "../postman";
import { Names } from "../types/msgin";
import { GetNames } from "../types/msgout";

export class NamesAgent {
    private resolve?: (msg: Names) => void
    private reject?: (err: Error) => void
    private errorTimeout: null|NodeJS.Timeout = null

    constructor(
        public postman: Postman
    ) {
        postman.on(Names, (msg) => {
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

    public async get(playerIds: number[]): Promise<Names> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<Names>((resolve, reject) => {
            this.reject = reject
            
            this.errorTimeout = setTimeout(() => {
                this.cleanup()
                reject(new Error('timeout'))
            }, 6000)

            this.resolve = (msg: Names) => {
                this.cleanup()
                resolve(msg)
            }

            this.postman.send(new GetNames(playerIds))
        })
    }
}
