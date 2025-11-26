"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const lobby_controller_1 = require("./controllers/lobby.controller");
const performance_controller_1 = require("./controllers/performance.controller");
const lobby_service_1 = require("./services/lobby.service");
const players_controller_1 = require("./controllers/players.controller");
const players_service_1 = require("./services/players.service");
const performance_service_1 = require("./services/performance.service");
const functions_controller_1 = require("./controllers/functions.controller");
const games_v_controller_1 = require("./controllers/games_v.controller");
const games_v_service_1 = require("./services/games_v.service");
const counter_controller_1 = require("./controllers/lobby/counter.controller");
const counter_service_1 = require("./services/lobby/counter.service");
const templates_controller_1 = require("./controllers/templates.controller");
const templates_service_1 = require("./services/templates.service");
const games_controller_1 = require("./controllers/games.controller");
const games_service_1 = require("./services/games.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [
            lobby_controller_1.LobbyController,
            counter_controller_1.CounterController,
            players_controller_1.PlayersController,
            templates_controller_1.TemplatesController,
            games_controller_1.GamesController,
            games_v_controller_1.GamesVController,
            performance_controller_1.PerformanceController,
            functions_controller_1.FunctionsController,
        ],
        providers: [
            lobby_service_1.LobbyService,
            counter_service_1.CounterService,
            players_service_1.PlayersService,
            templates_service_1.TemplatesService,
            games_service_1.GamesService,
            games_v_service_1.GamesVService,
            performance_service_1.PerformanceService,
        ],
    })
], AppModule);
