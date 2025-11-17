import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Online } from '../types/clickhouse/lobby';

@Injectable()
export class LobbyService {
    private client = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getChartData(after: number): Promise<Online[]> {
        let result = await (await this.client.query({
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
}
