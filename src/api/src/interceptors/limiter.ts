import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from "@nestjs/common"
import { finalize } from "rxjs"
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
        const start = Date.now()

        const ip_hash = crypto.createHash('sha256').update(req.headers['x-real-ip'] || req.ip || 'unknown')
            .digest('hex')
            .substring(0, 32)
        const token = req.headers['token']

        const url = String(req.url).split('?')[0].replace(/\d+/g, '#')

        const now = Date.now() / 1000
        const startOfMinute = Math.floor(now / 60) * 60
        const startOfHour = Math.floor(now / 3600) * 3600
        const startOfDay = Math.floor(now / 86400) * 86400

        let multi = this.redis.multi()

        multi.incr(`api:quota:${url}:minute:${startOfMinute}:ip_hash:${ip_hash}`)
        multi.incr(`api:quota:${url}:hour:${startOfHour}:ip_hash:${ip_hash}`)
        multi.incr(`api:quota:${url}:day:${startOfDay}:ip_hash:${ip_hash}`)
        multi.expireAt(`api:quota:${url}:minute:${startOfMinute}:ip_hash:${ip_hash}`, startOfMinute+60)
        multi.expireAt(`api:quota:${url}:hour:${startOfHour}:ip_hash:${ip_hash}`, startOfHour+3600)
        multi.expireAt(`api:quota:${url}:day:${startOfDay}:ip_hash:${ip_hash}`, startOfDay+86400)

        multi.get(`api:limiter:restriction:minute:${startOfMinute}:ip_hash:${ip_hash}`)
        multi.get(`api:limiter:restriction:hour:${startOfHour}:ip_hash:${ip_hash}`)
        multi.get(`api:limiter:restriction:day:${startOfDay}:ip_hash:${ip_hash}`)

        multi.get(`api:limiter:hits:ip_hash:${ip_hash}`)

        if (token) {
            multi.incr(`api:quota:${url}:minute:${startOfMinute}:token:${token}`)
            multi.incr(`api:quota:${url}:hour:${startOfHour}:token:${token}`)
            multi.incr(`api:quota:${url}:day:${startOfDay}:token:${token}`)
            multi.expireAt(`api:quota:${url}:minute:${startOfMinute}:token:${token}`, startOfMinute+60)
            multi.expireAt(`api:quota:${url}:hour:${startOfHour}:token:${token}`, startOfHour+3600)
            multi.expireAt(`api:quota:${url}:day:${startOfDay}:token:${token}`, startOfDay+86400)

            multi.get(`api:limiter:restriction:minute:token:${token}`)
            multi.get(`api:limiter:restriction:hour:token:${token}`)
            multi.get(`api:limiter:restriction:day:token:${token}`)

            multi.get(`api:limiter:hits:token:${token}`)
        }

        let data = await multi.exec()

        if (data[6] || (token && data[16])) {
            logger.info(`forbidden (for a minute): ${ip_hash}:${token || ''}`)
            throw new HttpException(`Too Many Requests. Rate Limit exceeded. Restriction will be lifted in the next minute`, 429)
        }

        if (data[7] || (token && data[17])) {
            logger.info(`forbidden (for a hour): ${ip_hash}:${token || ''}`)
            throw new HttpException(`Too Many Requests. Rate Limit exceeded. Restriction will be lifted in the next hour`, 429)
        }

        if (data[8] || (token && data[18])) {
            logger.info(`forbidden (for a day): ${ip_hash}:${token || ''}`)
            throw new HttpException(`Too Many Requests. Rate Limit exceeded. Restriction will be lifted in the next day`, 429)
        }
        
        if (Number(data[9]) >= 3 || (token && Number(data[19]) >= 3)) {
            logger.info(`forbidden (for a month): ${ip_hash}:${token || ''}`)
            throw new HttpException(`Forbidden`, 403)
        }


        let [minuteQuota, hourQuota, dayQuota] = [Number(data[0]), Number(data[1]), Number(data[2])]

        if (token) {
            [minuteQuota, hourQuota, dayQuota] = [minuteQuota + Number(data[10]), hourQuota + Number(data[11]), dayQuota + Number(data[12])]
        }

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
            multi.expireAt(`api:limiter:restriction:minute:${startOfMinute}:ip_hash:${ip_hash}`, startOfMinute+60)
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:minute:${startOfMinute}:token:${token}`, '1')
                multi.expireAt(`api:limiter:restriction:minute:${startOfMinute}:token:${token}`, startOfMinute+60)
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: minute rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        if (hourQuota >= hourLimit) {
            let multi = this.redis.multi()

            multi.set(`api:limiter:restriction:hour:ip_hash:${ip_hash}`, '1')
            multi.expireAt(`api:limiter:restriction:hour:ip_hash:${ip_hash}`, startOfHour+3600)
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:hour:token:${token}`, '1')
                multi.expireAt(`api:limiter:restriction:hour:token:${token}`, startOfHour+3600)
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: hour rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        if (dayQuota >= dayLimit) {
            let multi = this.redis.multi()

            multi.set(`api:limiter:restriction:day:ip_hash:${ip_hash}`, '1')
            multi.expireAt(`api:limiter:restriction:day:ip_hash:${ip_hash}`, startOfDay+86400)
            multi.incr(`api:limiter:hits:ip_hash:${ip_hash}`)
            if (token) {
                multi.set(`api:limiter:restriction:day:token:${token}`, '1')
                multi.expireAt(`api:limiter:restriction:day:token:${token}`, startOfDay+86400)
                multi.incr(`api:limiter:hits:token:${token}`)
            }

            multi.exec()

            logger.info(`${url}: hour rate limit exceeded: ${ip_hash}:${token || ''}`)

            throw new HttpException(`Too Many Requests. Rate Limit exceeded`, 429)
        }

        logger.info(`time: ${Date.now() - start}ms`)

        return next.handle().pipe();
    }
}
