import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { createClient } from '@clickhouse/client';
import { createClient as createClientRedis } from 'redis'
import { Player } from '../types/clickhouse/lobby';
import { Paginated, PlayerInfo } from '../types/api';
import { timestamp } from '../helpers/timestamp';

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
    
    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

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
                LIMIT {limit:UInt32}
            `,
            query_params: {
                query, 
                limit,
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

    async players(ids: number[]): Promise<Player[]> {
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

        return result
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

    async increasePlayerViews(id: number): Promise<void> {
        await this.mysql.execute(`INSERT INTO players_views (player_id, at) VALUES (?, ?)`, [id, timestamp.now()])
    }

    async getPopular(): Promise<Player[]> {
        const [rows] = await this.mysql.execute<RowDataPacket[]>(`
            SELECT player_id, COUNT(*) as views
            FROM players_views
            GROUP BY player_id
            ORDER BY views DESC
            LIMIT 20
        `);

        if (rows.length === 0) {
            return [];
        }

        const popularIds = rows.map(row => Number(row.player_id));

        const players = await this.players(popularIds);

        return players.sort((a, b) => {
            return popularIds.indexOf(a.id) - popularIds.indexOf(b.id);
        });
    }
}
