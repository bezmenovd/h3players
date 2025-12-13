import { Injectable } from '@nestjs/common';
import { createClient } from '@clickhouse/client';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';

@Injectable()
export class UserService {
    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

    private clickhouse = createClient({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    })
    
    async getUserPlayer(token: string): Promise<Player|null> {
        let [rows] = await this.mysql.execute<({ player_id: number } & RowDataPacket)[]>(
            'SELECT player_id FROM `tokens` WHERE token = ?',
            [token]
        )

        if (rows.length !== 1) {
            return null
        }

        let players = await (await this.clickhouse.query({
            query: `
                SELECT * FROM
                players
                WHERE id = {playerId:UInt32}
            `,
            query_params: {
                playerId: rows[0].player_id,
            },
            format: 'JSONEachRow',
        })).json<Player>()

        if (players.length !== 1) {
            return null
        }

        return players[0]
    }
}
