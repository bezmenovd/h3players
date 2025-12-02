import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'D.M.YYYY H:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, message, stack }) => `[${timestamp}]: ${stack || message}`)
    ),
    transports: [
        new DailyRotateFile({
            filename: `/var/www/output/api/%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            maxSize: '3m',
            maxFiles: '7d',
            format: format.uncolorize(),
        }),
    ]
});
