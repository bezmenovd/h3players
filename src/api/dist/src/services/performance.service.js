"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@clickhouse/client");
let PerformanceService = class PerformanceService {
    clickhouse = (0, client_1.createClient)({
        url: 'http://clickhouse:8123',
        username: 'default',
        password: 'xQm8LpsLOolVLryE',
        database: 'internal',
    });
    async getStatistics(after) {
        let result = await (await this.clickhouse.query({
            query: `
            select 
                toUnixTimestamp(toStartOfMinute(datetime)) as timestamp,
                name,
                sent_bytes,
                sent_messages,
                received_bytes,
                received_messages
            from statistics 
            where datetime > {after:UInt32} 
            order by datetime asc`,
            query_params: {
                after,
            },
            format: 'JSONEachRow',
        })).json();
        return result;
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)()
], PerformanceService);
