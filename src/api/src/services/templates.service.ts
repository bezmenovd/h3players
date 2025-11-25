import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Template } from '../types/clickhouse/lobby';
import { Paginated } from '../types/api';

@Injectable()
export class TemplatesService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(limit: number, offset: number, ids: number[] = []): Promise<Paginated<Template>> {
        let items = await (await this.clickhouse.query({
            query: `
                select * 
                from templates
                ${ ids.length > 0 ? `where id in {ids:Array(UInt32)}` : '' }
                order by id desc
                limit {limit:UInt32} offset {offset:UInt32}
            `,
            query_params: {
                limit,
                offset,
                ids,
            },
            format: 'JSONEachRow',
        })).json<Template>()

        let total = await (await this.clickhouse.query({
            query: `
                select count(*) as total
                from templates
                ${ ids.length > 0 ? `where id in {ids:Array(UInt32)}` : '' }
            `,
            query_params: {
                limit,
                offset,
                ids,
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

    async search(query: string, limit: number): Promise<Template[]> {
        let result = await (await this.clickhouse.query({
            query: `
                SELECT * FROM
                players
                WHERE positionCaseInsensitive(name, {query:String}) > 0
                ORDER BY levenshteinDistanceUTF8(upper(name), {query:String}) ASC
                LIMIT ${limit}
            `,
            query_params: {
                query, 
            },
            format: 'JSONEachRow',
        })).json<Template>()

        return result
    }
}
