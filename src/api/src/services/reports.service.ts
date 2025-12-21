import { Injectable } from '@nestjs/common';
import mysql from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';
import { timestamp } from '../helpers/timestamp';

@Injectable()
export class ReportsService {
    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

    async add(player: Player, entity_type: number, entity_id: number, reason: string): Promise<void> {
        await this.mysql.execute(
            'INSERT IGNORE INTO `reports` (player_id, entity_type, entity_id, reason, at) VALUES (?, ?, ?, ?, ?)',
            [player.id, entity_type, entity_id, reason, timestamp.now()]
        );
    }
}
