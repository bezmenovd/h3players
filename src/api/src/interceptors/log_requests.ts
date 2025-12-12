import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common"
import { catchError, finalize, tap, throwError } from "rxjs"
import { createClient as createClientRedis } from 'redis'
import crypto from 'crypto'
import { logger } from "../helpers/logger"


@Injectable()
export class LogRequestsInterceptor implements NestInterceptor {
    private redis = createClientRedis({
        socket: {
            host: 'redis',
        }
    })

    async onModuleInit() {
        await this.redis.connect()
    }

    async onModuleDestroy() {
        await this.redis.quit()
    }

    intercept(context: ExecutionContext, next: CallHandler) {
        const start = Date.now()

        const req = context.switchToHttp().getRequest()
        const url = String(req.url)
        const method = req.method

        const ip_hash = crypto.createHash('sha256').update(req.headers['x-real-ip'] || req.ip || 'unknown')
            .digest('hex')
            .substring(0, 32)

        const token = req.headers['X-Real-IP']
        
        const body = JSON.stringify(req.body)
    
        return next.handle().pipe(
            catchError((error) => {
                const duration = Date.now() - start
                const status = error instanceof HttpException 
                    ? error.getStatus() 
                    : 500

                logger.error(`${method} ${url}: ${status} (${error.message})`)

                this.redis.rPush('api:requests', JSON.stringify({
                    datetime: Math.floor(start / 1000),
                    duration,
                    ip_hash,
                    method,
                    url,
                    body,
                    status,
                })).catch(err => logger.error(err.message))

                return throwError(() => error); 
            }),
            
            tap(() => {
                const duration = Date.now() - start

                this.redis.rPush('api:requests', JSON.stringify({
                    datetime: Math.floor(start / 1000),
                    duration,
                    ip_hash,
                    method,
                    url,
                    body,
                    status: 200,
                })).catch(err => logger.error(err.message))
            }),

            finalize(async () => {
                const now = Date.now()
                const duration = now - start
                const startOfMinute = Math.floor(now / 1000 / 60) * 60
                const startOfHour = Math.floor(now / 1000 / 3600) * 3600
                const startOfDay = Math.floor(now / 1000 / 86400) * 86400

                const quotaUrl = url.split('?')[0].replace(/\d+/g, '#')

                const multi = this.redis.multi()

                multi.incrBy(`api:quota:${quotaUrl}:${startOfMinute}:ip_hash:${ip_hash}`, duration)
                multi.incrBy(`api:quota:${quotaUrl}:${startOfHour}:ip_hash:${ip_hash}`, duration)
                multi.incrBy(`api:quota:${quotaUrl}:${startOfDay}:ip_hash:${ip_hash}`, duration)
                multi.expireAt(`api:quota:${quotaUrl}:${startOfMinute}:ip_hash:${ip_hash}`, startOfMinute+60)
                multi.expireAt(`api:quota:${quotaUrl}:${startOfHour}:ip_hash:${ip_hash}`, startOfHour+3600)
                multi.expireAt(`api:quota:${quotaUrl}:${startOfDay}:ip_hash:${ip_hash}`, startOfDay+86400)

                if (token) {
                    multi.incrBy(`api:quota:${quotaUrl}:${startOfMinute}:token:${token}`, duration)
                    multi.incrBy(`api:quota:${quotaUrl}:${startOfHour}:token:${token}`, duration)
                    multi.incrBy(`api:quota:${quotaUrl}:${startOfDay}:token:${token}`, duration)
                    multi.expireAt(`api:quota:${quotaUrl}:${startOfMinute}:token:${token}`, startOfMinute+60)
                    multi.expireAt(`api:quota:${quotaUrl}:${startOfHour}:token:${token}`, startOfHour+3600)
                    multi.expireAt(`api:quota:${quotaUrl}:${startOfDay}:token:${token}`, startOfDay+86400)
                }

                multi.exec()
            })
        );
    }
}
