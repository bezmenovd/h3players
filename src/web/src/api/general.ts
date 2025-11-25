
export type Paginated<T> = {
    total: number
    limit: number
    offset: number
    items: T[]
}

export type PaginatedTable<T> = {
    total: number
    limit: number
    items: T[]
}
