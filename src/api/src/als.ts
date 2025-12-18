import { AsyncLocalStorage } from 'async_hooks';

export const als = new AsyncLocalStorage<{
    language: number
    token: string
}>();
