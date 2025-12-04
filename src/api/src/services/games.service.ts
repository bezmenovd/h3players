import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Game, GameWithInfo } from '../types/clickhouse/lobby';
import { Paginated } from '../types/api';

@Injectable()
export class GamesService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(limit: number, offset: number, date?: string): Promise<Paginated<GameWithInfo>> {
        let items = await (await this.clickhouse.query({
            query: `
                SELECT
                    *,
                    opponent_id, opponent_old_rating, opponent_new_rating,
                    dictGet('players_dictionary', 'name', host_id) AS host_name,
                    dictGet('players_dictionary', 'name', opponent_id) AS opponent_name,
                    dictGet('templates_dictionary', 'name', template_id) AS template_name
                FROM games
                ORDER BY end_timestamp DESC, id DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            format: 'JSONEachRow',
        })).json<GameWithInfo>()

        let total = await (await this.clickhouse.query({
            query: `
                SELECT count(*) as total
                FROM games
            `,
            format: 'JSONEachRow',
        })).json<{ total: number}>()

        return {
            total: Number(total[0].total),
            limit,
            offset,
            items,
        }
    }
}
