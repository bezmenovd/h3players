import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';
import { Discussion } from '../types/mysql/h3players';
import { makeSlug } from '../helpers/string';
import { timestamp } from '../helpers/timestamp';
import { PlayersService } from './players.service';

@Injectable()
export class DiscussionsService {
    constructor(private readonly playersService: PlayersService) {}

    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

    async getList(): Promise<DiscussionWithInfo[]> {
        let [rows] = await this.mysql.execute<(Discussion & RowDataPacket)[]>(
            'SELECT * FROM `discussions` ORDER BY created_at DESC',
            []
        )

        let players = this.playersService.players(rows.map(d => d.player_id))

        return rows
    }
    
    async add(player: Player, name: string): Promise<Discussion> {
        let [rows] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `discussions` WHERE player_id = ? AND created_at > ?',
            [player.id, timestamp.startOfDay()]
        )

        if (rows[0].count >= 3) {
            throw new Error('day_limit')
        }

        let slug = makeSlug(name)

        let [rows2] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `discussions` WHERE name = ? OR slug = ?',
            [name, slug]
        )

        if (rows2[0].count > 0) {
            throw new Error('duplicate')
        }

        await this.mysql.execute(
            'INSERT INTO `discussions` (player_id, name, slug, created_at) VALUES (?, ?, ?, ?)',
            [player.id, name, slug, timestamp.now()]
        )

        let [rows3] = await this.mysql.execute<(Discussion & RowDataPacket)[]>(
            'SELECT * FROM `discussions` WHERE name = ?',
            [name]
        )

        if (rows3.length === 0) {
            throw new Error('fail')
        }

        return rows3[0]
    }
}
