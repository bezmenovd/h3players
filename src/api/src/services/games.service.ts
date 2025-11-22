import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { GameV } from '../types/clickhouse/lobby';

@Injectable()
export class GamesService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(playerId: number, limit: number, offset: number): Promise<GameV[]> {
        let result = await (await this.clickhouse.query({
            query: `
                select * 
                from games_v
                where player_id = {playerId:UInt32}
                order by game_id desc
                limit {limit:UInt32} offset {offset:UInt32}
            `,
            query_params: {
                playerId,
                limit,
                offset,
            },
            format: 'JSONEachRow',
        })).json<GameV>()

        return result
    }
}
