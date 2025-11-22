import { Postman } from "../postman";
import { Templates } from "../types/msgin";
import { GetTemplates } from "../types/msgout";

export class TemplatesAgent {
    private resolve?: (msg: Templates) => void
    private reject?: (err: Error) => void
    private errorTimeout: null|NodeJS.Timeout = null

    constructor(
        public postman: Postman
    ) {
        postman.on(Templates, (msg) => {
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

    public async get(playerIds: number[]): Promise<Templates> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<Templates>((resolve, reject) => {
            this.reject = reject
            
            this.errorTimeout = setTimeout(() => {
                this.cleanup()
                reject(new Error('timeout'))
            }, 6000)

            this.resolve = (msg: Templates) => {
                this.cleanup()
                resolve(msg)
            }

            this.postman.send(new GetTemplates(playerIds))
        })
    }
}
