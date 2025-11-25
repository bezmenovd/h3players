import { Font } from "./modules/preload"

type Config = {
    resources: {
        [key: string]: (string | Font)[]
    }
}

const config: Config = {
    resources: {
        app: [
            {
                name: 'Exo 2',
                url: '/font/7cHmv4okm5zmbtYsK-4E4Q.woff2',
                format: 'woff2',
                unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
            },
            {
                name: 'Exo 2',
                url: '/font/7cHmv4okm5zmbtYoK-4.woff2',
                format: 'woff2',
                unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
            },
            '/img/lobby.png',
            '/img/players.png',
            '/img/performance.png',
            '/img/arrow-left.png',
            '/img/list.png',
            '/img/table/page.png',
            '/img/table/end.png',
        ]
    }
}

export default config
