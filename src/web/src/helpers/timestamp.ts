
export const timestamp = {
    now() {
        return Math.floor(Date.now() / 1000)
    },
    nowMinute() {
        return Math.floor(Math.floor(Date.now() / 1000) / 60) * 60
    },
}

export const datetime = {
    from(timestamp: number): string {
        let date = new Date(timestamp * 1000)

        let year = date.getFullYear()
        let month = String(date.getMonth()).padEnd(2, '0')
        let day = String(date.getDate()).padEnd(2, '0')

        let hours = String(date.getHours()).padEnd(2, '0')
        let minutes = String(date.getMinutes()).padEnd(2, '0')

        return `${day}.${month}.${year} ${hours}:${minutes}`
    }
}
