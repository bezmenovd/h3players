"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
const redis_1 = require("redis");
const timestamp_1 = require("../helpers/timestamp");
let LobbyService = class LobbyService {
    clickhouse = (0, client_1.createClient)({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    });
    redis = (0, redis_1.createClient)({
        socket: {
            host: 'redis',
        }
    });
    async onModuleInit() {
        await this.redis.connect();
    }
    async onModuleDestroy() {
        this.redis.destroy();
    }
    async getChartData(after) {
        let result = await (await this.clickhouse.query({
            query: `
                select 
                    toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                    online 
                from online 
                where datetime > {after:UInt32} 
                order by datetime asc`,
            query_params: {
                after,
            },
            format: 'JSONEachRow',
        })).json();
        return result;
    }
    async getVisitors() {
        return this.redis.sCard(`spectator:daily-visitors:${timestamp_1.date.from(timestamp_1.timestamp.now())}`);
    }
    async getGames() {
        let count = await (await this.clickhouse.query({
            query: `
                SELECT count(*) as value
                FROM games
                WHERE end_timestamp >= {startOfDay:UInt32}
            `,
            query_params: {
                startOfDay: timestamp_1.timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json();
        return count[0].value;
    }
    async getDailyTopByRating(limit, offset, anti = false, date) {
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
                startOfDay: timestamp_1.timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json();
        return items.map(i => ({
            id: i.id,
            name: i.name,
            rating_diff: Number(i.rating_diff),
        }));
    }
    async getDailyTopByGamesCount(limit, offset) {
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
                startOfDay: timestamp_1.timestamp.startOfDay(),
            },
            format: 'JSONEachRow',
        })).json();
        return items.map(i => ({
            id: i.id,
            name: i.name,
            games_count: Number(i.games_count),
        }));
    }
};
exports.LobbyService = LobbyService;
exports.LobbyService = LobbyService = __decorate([
    (0, common_1.Injectable)()
], LobbyService);
