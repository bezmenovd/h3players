import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { createClient as createClientRedis } from 'redis'
import { Player } from '../types/clickhouse/lobby';
import { Paginated, PlayerInfo } from '../types/api';

@Injectable()
export class PlayersService {
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

    async getList(limit: number, offset: number, ids: number[] = []): Promise<Paginated<Player>> {
        let items = await (await this.clickhouse.query({
            query: `
                select * 
                from players
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
        })).json<Player>()

        let total = await (await this.clickhouse.query({
            query: `
                select count(*) as total
                from players
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

    async search(query: string, limit: number): Promise<Player[]> {
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
        })).json<Player>()

        return result
    }

    async player(id: number): Promise<Player|null> {
        let result = await (await this.clickhouse.query({
            query: `
                SELECT * FROM
                players
                WHERE id = {id:UInt32}
            `,
            query_params: {
                id, 
            },
            format: 'JSONEachRow',
        })).json<Player>()

        return result.length === 1 ? result[0] : null
    }

    async players(ids: number[]): Promise<Player|null> {
        let result = await (await this.clickhouse.query({
            query: `
                SELECT * FROM
                players
                WHERE id in {ids:Array(UInt32)}
            `,
            query_params: {
                ids, 
            },
            format: 'JSONEachRow',
        })).json<Player>()

        return result.length === 1 ? result[0] : null
    }

    async playerRank(id: number): Promise<number> {
        let rank = await this.redis.zRevRank('rank', String(id))
        
        if (rank !== null) {
            rank = Number(rank)
            rank = Number.isFinite(rank) ? rank+1 : -1
        } else {
            rank = -1
        }

        return rank
    }

    async playerRating(id: number): Promise<number> {
        let ratingStr = await this.redis.get(`spectator:last-rating:${id}`)

        let rating = Number(ratingStr)
        rating = Number.isFinite(rating) ? rating+1 : -1

        return rating
    }
}
