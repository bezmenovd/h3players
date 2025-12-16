import { reactive } from 'vue'

export type Alert = {
    id: number
    text: string
    type: string
    duration: number
}

export const alerts = reactive({
    list: [] as Alert[],
    _nextId: 1,

    send(type: string, text: string, duration: number = 3000) {
        const id = this._nextId++
        const alert: Alert = { id, type, text, duration }
        
        this.list.push(alert)

        if (duration > 0) {
            setTimeout(() => {
                this.remove(id)
            }, duration)
        }
    },

    remove(id: number) {
        const index = this.list.findIndex(a => a.id === id)
        if (index !== -1) {
            this.list.splice(index, 1)
        }
    }
})
