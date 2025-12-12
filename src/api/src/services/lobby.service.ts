import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Game, GameWithInfo, Online } from '../types/clickhouse/lobby';
import { createClient as createClientRedis } from 'redis'
import { timestamp, date } from '../helpers/timestamp'
import { DailyTopPlayerWithGamesCount, DailyTopPlayerWithRatingDiff, Paginated } from '../types/api';

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
        await this.redis.quit()
    }

    async getChartData(after: number): Promise<Online[]> {
        let result = await (await this.clickhouse.query({
            query: `
                select 
                    toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                    argMax(online, datetime) AS online
                from online 
                where datetime > {after:UInt32} 
                group by timestamp
                order by timestamp asc`,
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

    async getDailyTopByRating(limit: number, offset: number, anti: boolean = false, date?: string): Promise<DailyTopPlayerWithRatingDiff[]> {
        let items = await (await this.clickhouse.query({
            query: `
                SELECT
                    sum(player_new_rating - player_old_rating) as rating_diff,
                    player_id as id,
                    max(end_timestamp) as end_timestamp_max,
                    dictGet('players_dictionary', 'name', player_id) AS name
                FROM games_v
                WHERE end_timestamp >= {startOfDay:UInt32}
                GROUP BY player_id
                ORDER BY rating_diff ${(anti ? 'ASC' : 'DESC')}, end_timestamp_max DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            query_params: {
                startOfDay: timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json<DailyTopPlayerWithRatingDiff>()

        return items.map(i => ({
            id: i.id,
            name: i.name,
            rating_diff: Number(i.rating_diff),
        }))
    }

    async getDailyTopByGamesCount(limit: number, offset: number, ): Promise<DailyTopPlayerWithGamesCount[]> {
        let items = await (await this.clickhouse.query({
            query: `
                SELECT
                    count(*) as games_count,
                    player_id as id,
                    max(end_timestamp) as end_timestamp_max,
                    dictGet('players_dictionary', 'name', player_id) AS name
                FROM games_v
                WHERE end_timestamp >= {startOfDay:UInt32} AND template_id != 1
                GROUP BY player_id
                ORDER BY games_count DESC, end_timestamp_max DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            query_params: {
                startOfDay: timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json<DailyTopPlayerWithGamesCount>()

        return items.map(i => ({
            id: i.id,
            name: i.name,
            games_count: Number(i.games_count),
        }))
    }
}
