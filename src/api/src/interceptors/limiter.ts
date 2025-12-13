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
        const token = req.headers['x-real-ip']

        const url = String(req.url).split('?')[0].replace(/\d+/g, '#')

        const now = Date.now() / 1000
        const startOfMinute = Math.floor(now / 60) * 60
        const startOfHour = Math.floor(now / 3600) * 3600
        const startOfDay = Math.floor(now / 86400) * 86400

        let hits

        if (token) {
            hits = Number(await this.redis.get(`api:limiter:hits:token:${token}`))   
        } else {
            hits = Number(await this.redis.get(`api:limiter:hits:ip_hash:${ip_hash}`))
        }
        
        if (hits >= 3) {
            logger.info(`forbidden: ${ip_hash}:${token || ''}`)
            throw new HttpException(`Forbidden`, 403)
        }

        let quotas

        if (token) {
            quotas = await this.redis.mGet([
                `api:quota:${url}:minute:${startOfMinute}:token:${token}`,
                `api:quota:${url}:hour:${startOfHour}:token:${token}`,
                `api:quota:${url}:day:${startOfDay}:token:${token}`
            ]);
        } else {
            quotas = await this.redis.mGet([
                `api:quota:${url}:minute:${startOfMinute}:ip_hash:${ip_hash}`,
                `api:quota:${url}:hour:${startOfHour}:ip_hash:${ip_hash}`,
                `api:quota:${url}:day:${startOfDay}:ip_hash:${ip_hash}`
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

        if (minuteQuota >= minuteLimit) {
            let multi = this.redis.multi()

            multi.set(`api:limiter:restriction:minute:${startOfMinute}:ip_hash:${ip_hash}`, '1')
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:minute:${startOfMinute}:token:${token}`, '1')
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: minute rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        if (hourQuota >= hourLimit) {
            let multi = this.redis.multi()

            multi.set(`api:limiter:restriction:hour:${startOfHour}:ip_hash:${ip_hash}`, '1')
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:hour:${startOfHour}:token:${token}`, '1')
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: hour rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        if (dayQuota >= dayLimit) {
            let multi = this.redis.multi()

            multi.set(`api:limiter:restriction:day:${startOfDay}:ip_hash:${ip_hash}`, '1')
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:day:${startOfDay}:token:${token}`, '1')
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: hour rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        return next.handle().pipe(tap(() => {
            const multi = this.redis.multi()

            multi.incr(`api:quota:${url}:minute:${startOfMinute}:ip_hash:${ip_hash}`)
            multi.incr(`api:quota:${url}:hour:${startOfHour}:ip_hash:${ip_hash}`)
            multi.incr(`api:quota:${url}:day:${startOfDay}:ip_hash:${ip_hash}`)
            multi.expireAt(`api:quota:${url}:minute:${startOfMinute}:ip_hash:${ip_hash}`, startOfMinute+60)
            multi.expireAt(`api:quota:${url}:hour:${startOfHour}:ip_hash:${ip_hash}`, startOfHour+3600)
            multi.expireAt(`api:quota:${url}:day:${startOfDay}:ip_hash:${ip_hash}`, startOfDay+86400)

            if (token) {
                multi.incr(`api:quota:${url}:minute:${startOfMinute}:token:${token}`)
                multi.incr(`api:quota:${url}:hour:${startOfHour}:token:${token}`)
                multi.incr(`api:quota:${url}:day:${startOfDay}:token:${token}`)
                multi.expireAt(`api:quota:${url}:minute:${startOfMinute}:token:${token}`, startOfMinute+60)
                multi.expireAt(`api:quota:${url}:hour:${startOfHour}:token:${token}`, startOfHour+3600)
                multi.expireAt(`api:quota:${url}:day:${startOfDay}:token:${token}`, startOfDay+86400)
            }

            multi.exec()
        }));
    }
}
