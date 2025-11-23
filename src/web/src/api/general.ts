
export type Paginated<T> = {
    total: number
    limit: number
    offset: number
    items: T[]
}
