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

        const token = req.headers['x-real-ip']
        
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
                    token,
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
                    token,
                    method,
                    url,
                    body,
                    status: 200,
                })).catch(err => logger.error(err.message))
            })
        );
    }
}
