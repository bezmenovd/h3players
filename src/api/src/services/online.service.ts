import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Online } from '../types/clickhouse';

@Injectable()
export class OnlineService {
    private client = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getOnlineChartData(after: number): Promise<Online[]> {
        let result = await (await this.client.query({
            query: `
            select 
                toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                online 
            from online 
            where datetime > ${after} 
            order by datetime asc`,
            format: 'JSONEachRow',
        })).json<Online>()

      return result
    }
}
