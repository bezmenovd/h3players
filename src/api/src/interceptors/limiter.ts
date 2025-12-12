import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common"
import { catchError, tap, throwError } from "rxjs"
import { createClient as createClientRedis } from 'redis'
import crypto from 'crypto'
import { logger } from "../helpers/logger"
import config from '../config.json'

@Injectable()
export class LimiterInterceptor implements NestInterceptor {
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

    async intercept(context: ExecutionContext, next: CallHandler) {
        const req = context.switchToHttp().getRequest()

        const ip_hash = crypto.createHash('sha256').update(req.headers['x-real-ip'] || req.ip || 'unknown')
            .digest('hex')
            .substring(0, 32)
        const token = req.headers['X-Real-IP']

        const url = String(req.url).split('?')[0].replace(/\d+/g, '#')

        const now = Date.now() / 1000
        const startOfMinute = Math.floor(now / 60) * 60
        const startOfHour = Math.floor(now / 3600) * 3600
        const startOfDay = Math.floor(now / 86400) * 86400

        let quotas

        if (token) {
            quotas = await this.redis.mGet([
                `api:quota:${url}:${startOfMinute}:token:${token}`,
                `api:quota:${url}:${startOfHour}:token:${token}`,
                `api:quota:${url}:${startOfDay}:token:${token}`
            ]);
        } else {
            quotas = await this.redis.mGet([
                `api:quota:${url}:${startOfMinute}:ip_hash:${ip_hash}`,
                `api:quota:${url}:${startOfHour}:ip_hash:${ip_hash}`,
                `api:quota:${url}:${startOfDay}:ip_hash:${ip_hash}`
            ]);
        }

        let [minuteQuota, hourQuota, dayQuota] = [Number(quotas[0]), Number(quotas[1]), Number(quotas[2])]

        let minuteLimit = (config.limits.ip as any)[url].minute
        let hourLimit = (config.limits.ip as any)[url].hour
        let dayLimit = (config.limits.ip as any)[url].day

        if (token && (config.limits.token as any)[url] !== undefined) {
            minuteLimit = (config.limits.token as any)[url].minute
            hourLimit = (config.limits.token as any)[url].hour
            dayLimit = (config.limits.token as any)[url].day
        }

        if (minuteQuota >= minuteLimit || hourQuota >= hourLimit || dayQuota >= dayLimit) {
            await this.redis.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                await this.redis.incr(`api:limiter:hits:token:${token}`)
            }

            logger.info(`rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        return next.handle();
    }
}
