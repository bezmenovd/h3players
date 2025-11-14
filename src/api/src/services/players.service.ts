import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import { Player } from '../types/clickhouse';
import { PlayerInfo } from '../types/api';

@Injectable()
export class PlayersService {
    private client = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })

    async getList(limit: number, offset: number): Promise<Player[]> {

        let result = await (await this.client.query({
            query: `
                select * 
                from players
                order by id desc
                limit ${limit} offset ${offset}
            `,
            format: 'JSONEachRow',
        })).json<Player>()

        return result
    }

    async search(query: string, limit: number): Promise<Player[]> {
        let result = await (await this.client.query({
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

    async info(id: number): Promise<PlayerInfo|null> {
        let result = await (await this.client.query({
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
}
