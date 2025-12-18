import { Headers, Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';
import { Discussion, DiscussionWithInfo } from '../types/mysql/h3players';
import { makeSlug } from '../helpers/string';
import { timestamp } from '../helpers/timestamp';
import { PlayersService } from './players.service';
import { OpenaiService } from './openai.service';
import { logger } from '../helpers/logger';
import { als } from '../als';
import { PermissionsService } from './permissions.service';

@Injectable()
export class DiscussionsService {
    constructor(
        private readonly playersService: PlayersService,
        private readonly openaiService: OpenaiService,
        private readonly permissonsService: PermissionsService,
    ) {}

    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

    async getList(): Promise<DiscussionWithInfo[]> {
        let [rows] = await this.mysql.execute<(DiscussionWithInfo & RowDataPacket)[]>(`
            SELECT 
                d.id,
                d.player_id,
                d.slug,
                MAX(t.value) as name,
                COUNT(p.id) AS posts_count
            FROM discussions d
            LEFT JOIN posts p ON d.id = p.discussion_id
            LEFT JOIN texts t ON d.id = t.entity_id AND t.entity_type = 1 AND t.language = ?
            WHERE
                d.is_public
            GROUP BY d.id
            ORDER BY d.created_at ASC
        `, [als.getStore()!.language])

        let players = await this.playersService.players(rows.map(d => d.player_id))

        return rows.map(r => ({
            ...r,
            player_name: players.find(p => p.id === r.player_id)?.name || '?',
        }))
    }
    
    async add(player: Player, name: string, userLanguage: number): Promise<Discussion> {
        let [rows] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `discussions` WHERE player_id = ? AND created_at > ?',
            [player.id, timestamp.startOfDay()]
        )

        // if (rows[0].count >= 3) {
        //     throw new Error('day_limit')
        // }

        name = name.trim()

        let result = await this.openaiService.moderateAndTranslate(name, userLanguage)

        if (! result.isValid) {
            this.permissonsService.handleViolation(player)
            throw new Error(`failed_moderation:${result.reason}`)
        }

        let slug = makeSlug(name)

        if (name.length > 32 || slug.length > 32) {
            throw new Error('invalid_name')
        }

        let [rows2] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `discussions` WHERE slug = ?',
            [slug]
        )

        if (rows2[0].count > 0) {
            throw new Error('duplicate')
        }

        let now = timestamp.now()

        await this.mysql.execute(
            'INSERT INTO `discussions` (player_id, slug, created_at) VALUES (?, ?, ?)',
            [player.id, slug, now]
        )

        let [rows3] = await this.mysql.execute<(Discussion & RowDataPacket)[]>(
            'SELECT * FROM `discussions` WHERE slug = ?',
            [slug]
        )

        if (rows3.length === 0) {
            throw new Error('fail')
        }

        await this.mysql.execute(
            `INSERT INTO texts 
            (player_id, entity_type, entity_id, language, value, created_at, updated_at) 
            VALUES
            (?, 1, ?, ?, ?, ?, ?)`,
            [player.id, rows3[0].id, userLanguage, name, now, now]
        )

        result.translations.forEach(async (t) => {
            await this.mysql.execute(
                `INSERT INTO texts 
                (player_id, entity_type, entity_id, language, value, created_at, updated_at) 
                VALUES
                (?, 1, ?, ?, ?, ?, ?)`,
                [player.id, rows3[0].id, t.lang, t.value, now, now]
            )
        })

        return rows3[0]
    }
}
