import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { TemplateWithInfo } from '../types/clickhouse/lobby';
import { Paginated } from '../types/api';

@Injectable()
export class TemplatesService {
    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(limit: number, offset: number, ids: number[] = [], query: string = ''): Promise<Paginated<TemplateWithInfo>> {
        const whereClauses: string[] = []
    
        if (ids.length > 0) {
            whereClauses.push('id in {ids:Array(UInt32)}')
        }
        if (query.length > 0) {
            whereClauses.push('positionCaseInsensitive(templates.name, {query:String}) > 0')
        }
        whereClauses.push('templates.id != 1')
    
        const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''
    
        const orderBy = query.length > 0
            ? 'ORDER BY levenshteinDistanceUTF8(upper(name), {query:String}) ASC, games_count DESC, id DESC'
            : 'ORDER BY games_count DESC, id DESC'
    
        const sql = `
            SELECT 
                min(templates.id) as id,
                templates.name as name,
                count(games.id) as games_count
            FROM templates
            LEFT JOIN games ON templates.id = games.template_id
            ${where}
            GROUP BY templates.name
            ${orderBy}
            LIMIT {limit:UInt32} OFFSET {offset:UInt32}
        `
    
        const items = await (await this.clickhouse.query({
            query: sql,
            query_params: { limit, offset, ids, query },
            format: 'JSONEachRow',
        })).json<TemplateWithInfo>()
    
        const totalResult = await (await this.clickhouse.query({
            query: `
            SELECT count() as total
            FROM (
                SELECT 1
                FROM templates
                LEFT JOIN games ON templates.id = games.template_id
                ${where}
                GROUP BY templates.name
            )
            `,
            query_params: { ids, query },
            format: 'JSONEachRow',
        })).json<{ total: number }>()
    
        return {
            total: Number(totalResult[0].total),
            limit,
            offset,
            items: items.map(i => ({
                id: i.id,
                name: i.name,
                games_count: Number(i.games_count),
            })),
        }
    }
}
