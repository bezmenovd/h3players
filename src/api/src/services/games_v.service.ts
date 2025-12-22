import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { GameVWithInfo } from '../types/clickhouse/lobby';
import { Paginated } from '../types/api';

@Injectable()
export class GamesVService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(playerId: number, limit: number, offset: number): Promise<Paginated<GameVWithInfo>> {
        let items = await (await this.clickhouse.query({
            query: `
                SELECT
                    *,
                    dictGet('players_dictionary', 'name', player_id) AS player_name,
                    dictGet('players_dictionary', 'name', opponent_id) AS opponent_name,
                    dictGet('templates_dictionary', 'name', template_id) AS template_name
                FROM games_v
                WHERE player_id = {playerId:UInt32}
                ORDER BY end_timestamp DESC, game_id DESC
                LIMIT {limit:UInt32} OFFSET {offset:UInt32}
            `,
            query_params: {
                playerId,
                limit,
                offset,
            },
            format: 'JSONEachRow',
        })).json<GameVWithInfo>()

        let total = await (await this.clickhouse.query({
            query: `
                SELECT count(*) as total
                FROM games_v
                WHERE player_id = {playerId:UInt32}
            `,
            query_params: {
                playerId,
                limit,
                offset,
            },
            format: 'JSONEachRow',
        })).json<{ total: number }>()

        return {
            total: Number(total[0].total),
            limit,
            offset,
            items,
        }
    }
}
