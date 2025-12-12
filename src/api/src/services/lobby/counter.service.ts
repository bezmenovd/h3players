import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { createClient as createClientRedis } from 'redis'
import { timestamp, date } from '../../helpers/timestamp'

@Injectable()
export class CounterService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

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

    async getVisitors(): Promise<number> {
        return this.redis.sCard(`spectator:daily-visitors:${date.from(timestamp.now())}`)
    }

    async getGames(): Promise<number> {
        let count = await (await this.clickhouse.query({
            query: `
                SELECT count(*) as value
                FROM games
                WHERE end_timestamp >= {startOfDay:UInt32}
            `,
            query_params: {
                startOfDay: timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json<{ value: number }>()

        return count[0].value
    }
}
