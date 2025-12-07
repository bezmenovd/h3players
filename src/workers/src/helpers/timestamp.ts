
export const timestamp = {
    now() {
        return Math.floor(Date.now() / 1000)
    }
}

export const datetime = {
    from(timestamp: number): string {
        let date = new Date(timestamp * 1000)

        let year = date.getFullYear()
        let month = String(date.getMonth()+1).padStart(2, '0')
        let day = String(date.getDate()).padStart(2, '0')

        let hours = String(date.getHours()).padStart(2, '0')
        let minutes = String(date.getMinutes()).padStart(2, '0')

        return `${day}.${month}.${year} ${hours}:${minutes}`
    }
}

export const date = {
    from(timestamp: number): string {
        let date = new Date(timestamp * 1000)

        let year = date.getFullYear()
        let month = String(date.getMonth()+1).padStart(2, '0')
        let day = String(date.getDate()).padStart(2, '0')

        return `${day}.${month}.${year}`
    }
}
