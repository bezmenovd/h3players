import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Statistics } from '../types/clickhouse/internal';

@Injectable()
export class PerformanceService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'internal',
    })

    async getStatistics(after: number): Promise<Statistics[]> {
        let result = await (await this.clickhouse.query({
            query: `
            select 
                toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                name,
                sent_bytes,
                sent_messages,
                received_bytes,
                received_messages
            from statistics 
            where datetime > {after:UInt32} 
            order by datetime asc`,
            query_params: {
                after,
            },
            format: 'JSONEachRow',
        })).json<Statistics>()

      return result
    }
}
