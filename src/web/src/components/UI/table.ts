import { RouteLocationRaw } from 'vue-router';

type ColumnAttributes<T> = {
    name: string
    code: string
    align?: string
    width?: string
    link?: (row: T) => RouteLocationRaw
}

export class Column<T = any> {
    public name: string
    public code: string
    public align: string
    public width: string
    public link?: (row: T) => RouteLocationRaw

    constructor(attributes: ColumnAttributes<T>) {
        this.name = attributes.name
        this.code = attributes.code
        this.align = attributes.align ?? 'left'
        this.width = attributes.width ?? 'auto'
        this.link = attributes.link
    }
}
