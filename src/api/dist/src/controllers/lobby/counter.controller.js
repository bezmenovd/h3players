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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterController = void 0;
const common_1 = require("@nestjs/common");
const counter_service_1 = require("../../services/lobby/counter.service");
let CounterController = class CounterController {
    counterService;
    constructor(counterService) {
        this.counterService = counterService;
    }
    async visitors() {
        let visitors = await this.counterService.getVisitors();
        return {
            value: visitors
        };
    }
    async games() {
        let games = await this.counterService.getGames();
        return {
            value: games
        };
    }
};
exports.CounterController = CounterController;
__decorate([
    (0, common_1.Get)('/visitors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CounterController.prototype, "visitors", null);
__decorate([
    (0, common_1.Get)('/games'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CounterController.prototype, "games", null);
exports.CounterController = CounterController = __decorate([
    (0, common_1.Controller)('lobby/counter'),
    __metadata("design:paramtypes", [counter_service_1.CounterService])
], CounterController);
