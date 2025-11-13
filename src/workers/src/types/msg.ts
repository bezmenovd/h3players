
export abstract class Msg {
    public static code: number

    public getCode(): number {
        return (this.constructor as typeof Msg).code
    }
}


export function Code(code: number) {
    return function (constructor: Function) {
        (constructor as any).code = code
    }
}

