import { Injectable } from '@nestjs/common';
import mysql, { RowDataPacket } from 'mysql2/promise';
import { Player } from '../types/clickhouse/lobby';
import { timestamp } from '../helpers/timestamp';
import { Restriction } from '../types/mysql/h3players';
import { createClient as createClientRedis } from 'redis'
import { logger } from '../helpers/logger';


@Injectable()
export class PermissionsService {
    private mysql = mysql.createPool({
        host: 'h3players-mysql',
        user: 'user',
        database: 'h3players',
        password: 'jk7S91xAC5bE5l3I',
    });

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

    async getPlayerPermissions(player: Player): Promise<string[]> {
        let [rows] = await this.mysql.execute<({ code: string } & RowDataPacket)[]>(
            'SELECT code FROM `permissions` WHERE player_id = ?',
            [player.id]
        )

        return rows.map(r => r.code)
    }

    async authorize(player: Player, permission: string): Promise<boolean> {
        let [rows] = await this.mysql.execute<({ code: string } & RowDataPacket)[]>(
            'SELECT count(*) FROM `permissions` WHERE player_id = ? AND code = ?',
            [player.id, permission]
        )
        
        return rows.length === 1
    }

    async getRestriction(player: Player): Promise<Restriction|null> {
        let now = timestamp.now()

        let [rows] = await this.mysql.execute<(Restriction & RowDataPacket)[]>(
            'SELECT * FROM `restrictions` WHERE player_id = ? AND start_at <= ? AND finish_at >= ?',
            [player.id, now, now]
        )
        
        return rows.length > 0 ? rows[0] : null
    }

    async handleViolation(player: Player): Promise<void> {
        const now = timestamp.now()

        const startOfMinute = Math.floor(now / 60) * 60
        const startOfHour = Math.floor(now / 3600) * 3600
        const startOfDay = Math.floor(now / 86400) * 86400

        let multi = this.redis.multi()

        multi.incr(`violations::minute:${player.id}`)
        multi.incr(`violations::hour:${player.id}`)
        multi.incr(`violations::day:${player.id}`)
        multi.expireAt(`violations::minute:${player.id}`, startOfMinute+60)
        multi.expireAt(`violations::hour:${player.id}`, startOfHour+3600)
        multi.expireAt(`violations::day:${player.id}`, startOfDay+86400)

        let data = await multi.exec()

        if (Number(data[2]) > 20) {
            logger.info(`player #${player.id} restricted for a week`)

            await this.mysql.execute<(Restriction & RowDataPacket)[]>(
                'INSERT INTO `restrictions` (player_id, start_at, finish_at, reason) VALUES (?, ?, ?, ?)',
                [player.id, now, now+(86400*7), 'day_limit']
            )

            return
        }

        if (Number(data[2]) > 10) {
            logger.info(`player #${player.id} restricted for a day`)

            await this.mysql.execute<(Restriction & RowDataPacket)[]>(
                'INSERT INTO `restrictions` (player_id, start_at, finish_at, reason) VALUES (?, ?, ?, ?)',
                [player.id, now, now+86400, 'hour_limit']
            )
            
            return
        }

        if (Number(data[2]) > 3) {
            logger.info(`player #${player.id} restricted for a hour`)

            await this.mysql.execute<(Restriction & RowDataPacket)[]>(
                'INSERT INTO `restrictions` (player_id, start_at, finish_at, reason) VALUES (?, ?, ?, ?)',
                [player.id, now, now+3600, 'minute_limit']
            )
            
            return
        }
    }
}
