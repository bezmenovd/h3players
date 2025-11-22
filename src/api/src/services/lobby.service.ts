import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Online } from '../types/clickhouse/lobby';
import { createClient as createClientRedis } from 'redis'
import { timestamp, date } from '../helpers/timestamp'

@Injectable()
export class LobbyService {
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
        this.redis.destroy()
    }

    async getChartData(after: number): Promise<Online[]> {
        let result = await (await this.clickhouse.query({
            query: `
                select 
                    toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                    online 
                from online 
                where datetime > {after:UInt32} 
                order by datetime asc`,
            query_params: {
                after,
            },
            format: 'JSONEachRow',
        })).json<Online>()

        return result
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
