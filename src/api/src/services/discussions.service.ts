import { Headers, Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';
import { Discussion, DiscussionWithInfo } from '../types/mysql/h3players';
import { timestamp } from '../helpers/timestamp';
import { PlayersService } from './players.service';
import { OpenaiService } from './openai.service';
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
        const [rows] = await this.mysql.execute<(DiscussionWithInfo & RowDataPacket)[]>(`
            SELECT 
                d.id,
                d.player_id,
                ANY_VALUE(t.value) as name,
                COUNT(p.id) AS posts_count
            FROM discussions d
            LEFT JOIN posts p ON d.id = p.discussion_id
            LEFT JOIN texts t ON d.id = t.entity_id AND t.entity_type = 1 AND t.language = ?
            WHERE
                d.is_public
            GROUP BY d.id
            ORDER BY d.created_at ASC
        `, [als.getStore()!.language])

        const players = await this.playersService.players(rows.map(d => d.player_id))

        return rows.map(r => ({
            ...r,
            player_name: players.find(p => p.id === r.player_id)?.name || '?',
        }))
    }
    
    async add(player: Player, name: string): Promise<Discussion> {
        const [discussions] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `discussions` WHERE player_id = ? AND created_at > ?',
            [player.id, timestamp.startOfDay()]
        )

        if (discussions[0].count >= 3 && ! await this.permissonsService.authorize(player, 'discussions.add.unlimit')) {
            throw new Error('day_limit')
        }

        name = name.trim()

        if (name.length > 32) {
            throw new Error('invalid_name')
        }

        const [texts] = await this.mysql.execute<({ count: number } & RowDataPacket)[]>(
            'SELECT count(*) as count FROM `texts` WHERE value = ? AND entity_type = 1',
            [name]
        )

        if (texts[0].count > 0) {
            throw new Error('duplicate')
        }

        const result = await this.openaiService.moderateAndTranslate(name, als.getStore()!.language)

        if (! result.isValid) {
            this.permissonsService.handleViolation(player)
            throw new Error(`failed_moderation:${result.reason}`)
        }

        const now = timestamp.now()

        await this.mysql.execute(
            'INSERT INTO `discussions` (player_id, created_at) VALUES (?, ?)',
            [player.id, now]
        )

        const [discussionsAdded] = await this.mysql.execute<(Discussion & RowDataPacket)[]>(
            'SELECT * FROM `discussions` WHERE player_id = ? AND created_at = ?',
            [player.id, now]
        )

        if (discussionsAdded.length === 0) {
            throw new Error('fail')
        }

        await this.mysql.execute(
            `INSERT INTO texts 
            (player_id, entity_type, entity_id, language, value, created_at, updated_at) 
            VALUES
            (?, 1, ?, ?, ?, ?, ?)`,
            [player.id, discussionsAdded[0].id, als.getStore()!.language, name, now, now]
        )

        Promise.all(result.translations.map(async (t) => {
            await this.mysql.execute(
                `INSERT INTO texts 
                (player_id, entity_type, entity_id, language, value, created_at, updated_at) 
                VALUES
                (?, 1, ?, ?, ?, ?, ?)`,
                [player.id, discussionsAdded[0].id, t.lang, t.value, now, now]
            )
        }))

        return discussionsAdded[0]
    }
}
