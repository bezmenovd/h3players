import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { GameWithInfo, Template, TemplateGamesChartItem, TemplatesDurationChartItem, TemplatesEndDayChartItem, TemplatesStatisticsChartItem, TemplateStats, TemplateWithInfo } from '../types/clickhouse/lobby';
import { Paginated } from '../types/api';
import { timestamp } from '../helpers/timestamp';

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
    
        const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''
    
        const orderBy = query.length > 0
            ? 'ORDER BY games_count DESC, levenshteinDistanceUTF8(upper(name), {query:String}) ASC, id DESC'
            : 'ORDER BY games_count DESC, id DESC'
    
        const sql = `
            SELECT 
                min(t.id) as id,
                t.name,
                SUM(t_stats.games_count) as games_count,
                SUM(t_stats.games_duration) as games_duration,
                uniqMerge(t_stats.players_uniq) AS players_count
            FROM templates AS t
            LEFT JOIN templates_mv_stats_table AS t_stats ON t.id = t_stats.id
            ${where}
            GROUP by templates.name
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
                games_duration: Number(i.games_duration),
                players_count: Number(i.players_count),
            })),
        }
    }

    async getTemplate(id: number): Promise<Template|null> {
        const templates = await (await this.clickhouse.query({
            query: `
                SELECT *
                FROM templates
                WHERE id = {id:UInt32}
            `,
            query_params: { 
                id,
            },
            format: 'JSONEachRow',
        })).json<Template>()

        return templates.length > 0 ? templates[0] : null
    }

    async getFirstGame(ids: number[]): Promise<GameWithInfo|null> {
        const result = await (await this.clickhouse.query({
            query: `
                SELECT
                    *,
                    dictGet('players_dictionary', 'name', host_id) AS host_name,
                    dictGet('players_dictionary', 'name', opponent_id) AS opponent_name,
                    dictGet('templates_dictionary', 'name', template_id) AS template_name
                FROM games
                WHERE template_id in {ids:Array(UInt32)}
                ORDER BY start_timestamp ASC LIMIT 1
            `,
            query_params: { 
                ids,
            },
            format: 'JSONEachRow',
        })).json<GameWithInfo>();

        return result.length === 1 ? result[0] : null
    }

    async getVersions(name: string): Promise<Template[]> {
        const templates = await (await this.clickhouse.query({
            query: `
                SELECT *
                FROM templates
                WHERE name = {name:String}
            `,
            query_params: { 
                name,
            },
            format: 'JSONEachRow',
        })).json<Template>()

        return templates
    }

    async getStats(name: string): Promise<TemplateStats> {
        const result = await (await this.clickhouse.query({
            query: `
                SELECT 
                    SUM(t_stats.games_count) as games_count,
                    SUM(t_stats.games_duration) as games_duration,
                    uniqMerge(t_stats.players_uniq) AS players_count
                FROM templates AS t
                INNER JOIN templates_mv_stats_table AS t_stats ON t.id = t_stats.id
                WHERE t.name = {name:String}
            `,
            query_params: { 
                name,
            },
            format: 'JSONEachRow',
        })).json<{ games_count: string, games_duration: string, players_count: string }>();

        if (result.length === 0 || !result[0].games_count) {
            return { games_count: 0, games_duration: 0, players_count: 0 };
        }

        return {
            games_count: Number(result[0].games_count),
            games_duration: Number(result[0].games_duration),
            players_count: Number(result[0].players_count),
        };
    }

    async getGamesChart(ids: number[]): Promise<TemplateGamesChartItem[]> {
        const result = await (await this.clickhouse.query({
            query: `
                SELECT 
                    toUnixTimestamp(toStartOfDay(toDateTime(g.end_timestamp))) as start_of_day,
                    count() as games_count
                FROM games AS g
                WHERE g.template_id in {ids:Array(UInt32)}
                GROUP BY start_of_day
                ORDER BY start_of_day ASC 
                WITH FILL TO{today:UInt32} + 1 STEP 86400
            `,
            query_params: { 
                ids,
                today: timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json<TemplateGamesChartItem>();

        return result.map(row => ({
            start_of_day: Number(row.start_of_day),
            games_count: Number(row.games_count)
        }));
    }

    async getDurationChart(ids: number[]): Promise<TemplatesDurationChartItem[]> {
        const sql = `
            SELECT 
                floor((g.end_timestamp - g.start_timestamp) / 60) as duration,
                count() as games_count
            FROM games AS g
            WHERE g.template_id IN {ids:Array(UInt32)}
              AND g.end_timestamp > g.start_timestamp
              AND g.end_timestamp - g.start_timestamp < 57600
            GROUP BY duration
            ORDER BY duration ASC
            WITH FILL FROM 1 TO 961 STEP 1
        `;
    
        const result = await (await this.clickhouse.query({
            query: sql,
            query_params: { ids },
            format: 'JSONEachRow',
        })).json<TemplatesDurationChartItem>();
    
        return result.map(row => ({
            duration: Number(row.duration),
            games_count: Number(row.games_count)
        }));
    }

    async getEndDayChart(ids: number[]): Promise<TemplatesEndDayChartItem[]> {
        const sql = `
            SELECT 
                end_day,
                count() as games_count
            FROM games AS g
            WHERE g.template_id IN {ids:Array(UInt32)}
              AND g.end_timestamp > g.start_timestamp
              AND g.end_timestamp - g.start_timestamp < 57600
            GROUP BY end_day
            ORDER BY end_day ASC
            WITH FILL FROM 1 TO 253 STEP 1
        `;
    
        const result = await (await this.clickhouse.query({
            query: sql,
            query_params: { ids },
            format: 'JSONEachRow',
        })).json<TemplatesEndDayChartItem>();
    
        return result.map(row => ({
            end_day: Number(row.end_day),
            games_count: Number(row.games_count)
        }));
    }

    async getStatistics(offset: number = 0): Promise<TemplatesStatisticsChartItem[]> {
        const monthAgo = timestamp.startOfDay() - (30 * 86400);
        const todayStart = timestamp.startOfDay();
    
        const topNamesResult = await (await this.clickhouse.query({
            query: `
                SELECT if(t.name = '', 'scenario', t.name) as display_name
                FROM games AS g
                INNER JOIN templates AS t ON g.template_id = t.id
                WHERE g.end_timestamp >= {monthAgo:UInt32}
                GROUP BY display_name
                ORDER BY count() DESC
                LIMIT 10 OFFSET {offset:UInt32}
            `,
            query_params: { monthAgo, offset },
            format: 'JSONEachRow',
        })).json<{ display_name: string }>();
    
        if (topNamesResult.length === 0) return [];
    
        const topNames = topNamesResult.map(t => t.display_name);
    
        const result = await (await this.clickhouse.query({
            query: `
                SELECT 
                    toUnixTimestamp(toStartOfDay(toDateTime(g.end_timestamp))) as start_of_day,
                    if(t.name = '', 'scenario', t.name) as display_name,
                    count() as games_count
                FROM games AS g
                INNER JOIN templates AS t ON g.template_id = t.id
                WHERE display_name IN {topNames:Array(String)}
                  AND g.end_timestamp >= {monthAgo:UInt32}
                GROUP BY start_of_day, display_name
                ORDER BY start_of_day ASC
            `,
            query_params: { topNames, monthAgo },
            format: 'JSONEachRow',
        })).json<{ start_of_day: string, display_name: string, games_count: string }>();
    
        const chartMap = new Map<number, TemplatesStatisticsChartItem>();
        
        for (let day = monthAgo; day <= todayStart; day += 86400) {
            const item: TemplatesStatisticsChartItem = { start_of_day: day, templates: {} };
            topNames.forEach(name => item.templates[name] = 0);
            chartMap.set(day, item);
        }
    
        result.forEach(row => {
            const time = Number(row.start_of_day);
            const dayEntry = chartMap.get(time);
            if (dayEntry && row.display_name !== undefined) {
                dayEntry.templates[row.display_name] = Number(row.games_count);
            }
        });
    
        return Array.from(chartMap.values());
    }
}
