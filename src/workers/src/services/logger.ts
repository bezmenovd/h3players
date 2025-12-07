import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const LOG_PATH = process.env.LOG_PATH;

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD.MM.YYYY H:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, message, stack }) => `[${timestamp}]: ${stack || message}`)
    ),
    transports: LOG_PATH ? [
        new DailyRotateFile({
            filename: `${LOG_PATH}/%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '3m',
            maxFiles: '7d',
            format: format.uncolorize(),
        }),
    ] : [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp({ format: 'DD.MM.YYYY H:mm:ss' }),
                format.printf(({ timestamp, message, stack }) => `[${timestamp}]: ${stack || message}`)
            ),
        }),
    ],
});
