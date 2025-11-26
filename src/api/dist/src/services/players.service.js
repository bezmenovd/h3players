"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
let PlayersService = class PlayersService {
    clickhouse = (0, client_1.createClient)({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    });
    async getList(limit, offset, ids = []) {
        let items = await (await this.clickhouse.query({
            query: `
                select * 
                from players
                ${ids.length > 0 ? `where id in {ids:Array(UInt32)}` : ''}
                order by id desc
                limit {limit:UInt32} offset {offset:UInt32}
            `,
            query_params: {
                limit,
                offset,
                ids,
            },
            format: 'JSONEachRow',
        })).json();
        let total = await (await this.clickhouse.query({
            query: `
                select count(*) as total
                from players
                ${ids.length > 0 ? `where id in {ids:Array(UInt32)}` : ''}
            `,
            query_params: {
                limit,
                offset,
                ids,
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
    async search(query, limit) {
        let result = await (await this.clickhouse.query({
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
        })).json();
        return result;
    }
    async info(id) {
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
        })).json();
        return result.length === 1 ? result[0] : null;
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)()
], PlayersService);
