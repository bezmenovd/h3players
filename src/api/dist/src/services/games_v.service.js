"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesVService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
let GamesVService = class GamesVService {
    clickhouse = (0, client_1.createClient)({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    });
    async getList(playerId, limit, offset) {
        let items = await (await this.clickhouse.query({
            query: `
                SELECT
                    *,
                    dictGet('players_dictionary', 'name', player_id) AS player_name,
                    dictGet('players_dictionary', 'name', opponent_id) AS opponent_name,
                    dictGet('templates_dictionary', 'name', template_id) AS template_name
                FROM games_v
                WHERE player_id = {playerId:UInt32}
                ORDER BY end_timestamp DESC, game_id DESC
                LIMIT ${limit} OFFSET ${offset}
            `,
            query_params: {
                playerId,
                limit,
                offset,
            },
            format: 'JSONEachRow',
        })).json();
        let total = await (await this.clickhouse.query({
            query: `
                SELECT count(*) as total
                FROM games_v
                WHERE player_id = {playerId:UInt32}
            `,
            query_params: {
                playerId,
                limit,
                offset,
            },
            format: 'JSONEachRow',
        })).json();
        return {
            total: Number(total[0].total),
            limit,
            offset,
            items,
        };
    }
};
exports.GamesVService = GamesVService;
exports.GamesVService = GamesVService = __decorate([
    (0, common_1.Injectable)()
], GamesVService);
