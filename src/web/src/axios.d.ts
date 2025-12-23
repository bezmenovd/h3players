import 'axios';

declare module 'axios' {
    export interface AxiosRequestConfig {
        _errorsPath?: string
        _ignoreErrors?: boolean
        _contentLoader?: boolean
    }

    export interface InternalAxiosRequestConfig {
        _errorsPath?: string
        _ignoreErrors?: boolean
        _contentLoader?: boolean
    }
}
