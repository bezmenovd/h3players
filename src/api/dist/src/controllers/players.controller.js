"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersController = void 0;
const common_1 = require("@nestjs/common");
const players_service_1 = require("../services/players.service");
let PlayersController = class PlayersController {
    playersService;
    constructor(playersService) {
        this.playersService = playersService;
    }
    async list(limit, offset, ids) {
        let l = Math.min(Number(limit) || 30, 100);
        let o = Number(offset) || 0;
        let i = String(ids).split(',').map(id => parseInt(id)).filter(e => e) || [];
        let data = await this.playersService.getList(l, o, i);
        return data;
    }
    async search(query, limit) {
        if (query.length === 0) {
            return [];
        }
        let q = query.replace(/[^a-zA-Z0-9_ \-=@.!#$%^&*]/g, '').toUpperCase();
        let l = Math.min(Number(limit) || 10, 100);
        let data = await this.playersService.search(q, l);
        return data;
    }
    async info(id) {
        const i = Number(id);
        if (!i) {
            return {};
        }
        let info = this.playersService.info(i);
        if (!info) {
            throw new common_1.NotFoundException();
        }
        return info;
    }
};
exports.PlayersController = PlayersController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlayersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('/search'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PlayersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayersController.prototype, "info", null);
exports.PlayersController = PlayersController = __decorate([
    (0, common_1.Controller)('players'),
    __metadata("design:paramtypes", [players_service_1.PlayersService])
], PlayersController);
