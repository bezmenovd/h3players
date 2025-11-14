import { Postman } from "../postman";
import { Names } from "../types/msgin";
import { GetNames } from "../types/msgout";

export class NamesAgent {
    private resolve?: (msg: Names) => void
    private reject?: () => void

    constructor(
        public postman: Postman
    ) {
        postman.on(Names, (msg) => {
            if (this.resolve) {
                this.resolve(msg)
            }
        })

        postman.client.onDisconnect(() => {
            if (this.reject) {
                this.reject()
            }
        })
    }

    public async get(playerIds: number[]): Promise<Names> {
        if (this.resolve) {
            throw new Error("concurrent requests are forbidden");
        }

        return new Promise<Names>((resolve, reject) => {
            this.reject = reject

            let errorTimeout =  setTimeout(this.reject, 5000)

            this.resolve = (msg: Names) => {
                clearTimeout(errorTimeout)
                this.reject = undefined
                this.resolve = undefined
                resolve(msg)
            }

            this.postman.send(new GetNames(playerIds))
        })
    }
}
