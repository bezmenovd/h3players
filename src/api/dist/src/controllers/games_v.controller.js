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
exports.GamesVController = void 0;
const common_1 = require("@nestjs/common");
const games_v_service_1 = require("../services/games_v.service");
let GamesVController = class GamesVController {
    gamesVService;
    constructor(gamesVService) {
        this.gamesVService = gamesVService;
    }
    async list(playerId, limit, offset) {
        let p = Number(playerId);
        let l = Math.min(Number(limit) || 1000, 1000);
        let o = Number(offset) || 0;
        let data = await this.gamesVService.getList(p, l, o);
        return data;
    }
};
exports.GamesVController = GamesVController;
__decorate([
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Query)('playerId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GamesVController.prototype, "list", null);
exports.GamesVController = GamesVController = __decorate([
    (0, common_1.Controller)('games_v'),
    __metadata("design:paramtypes", [games_v_service_1.GamesVService])
], GamesVController);
