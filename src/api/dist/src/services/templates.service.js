"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
let TemplatesService = class TemplatesService {
    clickhouse = (0, client_1.createClient)({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'lobby',
    });
    async getList(limit, offset, ids = [], query = '') {
        const whereClauses = [];
        if (ids.length > 0) {
            whereClauses.push('id in {ids:Array(UInt32)}');
        }
        if (query.length > 0) {
            whereClauses.push('positionCaseInsensitive(templates.name, {query:String}) > 0');
        }
        whereClauses.push('templates.id != 1');
        const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
        const orderBy = query.length > 0
            ? 'ORDER BY levenshteinDistanceUTF8(upper(name), {query:String}) ASC, games_count DESC, id DESC'
            : 'ORDER BY games_count DESC, id DESC';
        const sql = `
            SELECT 
                min(templates.id) as id,
                templates.name as name,
                count(games.id) as games_count
            FROM templates
            LEFT JOIN games ON templates.id = games.template_id
            ${where}
            GROUP BY templates.name
            ${orderBy}
            LIMIT {limit:UInt32} OFFSET {offset:UInt32}
        `;
        const items = await (await this.clickhouse.query({
            query: sql,
            query_params: { limit, offset, ids, query },
            format: 'JSONEachRow',
        })).json();
        const totalResult = await (await this.clickhouse.query({
            query: `
            SELECT count() as total
            FROM (
                SELECT 1
                FROM templates
                LEFT JOIN games ON templates.id = games.template_id
                ${where}
                GROUP BY templates.name
            )
            `,
            query_params: { ids, query },
            format: 'JSONEachRow',
        })).json();
        return {
            total: Number(totalResult[0].total),
            limit,
            offset,
            items: items.map(i => ({
                id: i.id,
                name: i.name,
                games_count: Number(i.games_count),
            })),
        };
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)()
], TemplatesService);
