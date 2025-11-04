import pino from 'pino';

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: false,
            translateTime: 'dd.mm.yyyy HH:MM:ss',
            ignore: 'pid,hostname,level',
        },
    },
})
