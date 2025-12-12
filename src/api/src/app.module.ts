import { Module } from '@nestjs/common';
import { LobbyController } from './controllers/lobby.controller';
import { PerformanceController } from './controllers/performance.controller';
import { LobbyService } from './services/lobby.service';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { PerformanceService } from './services/performance.service';
import { FunctionsController } from './controllers/functions.controller';
import { GamesVController } from './controllers/games_v.controller';
import { GamesVService } from './services/games_v.service';
import { CounterController } from './controllers/lobby/counter.controller';
import { CounterService } from './services/lobby/counter.service';
import { TemplatesController } from './controllers/templates.controller';
import { TemplatesService } from './services/templates.service';
import { GamesController } from './controllers/games.controller';
import { GamesService } from './services/games.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogRequestsInterceptor } from './interceptors/log_requests';
import { LimiterInterceptor } from './interceptors/limiter';


@Module({
    imports: [],
    controllers: [
        LobbyController,
        CounterController,
        PlayersController,
        TemplatesController,
        GamesController,
        GamesVController,
        PerformanceController,
        FunctionsController,
    ],
    providers: [
        { provide: APP_INTERCEPTOR, useClass: LimiterInterceptor },
        { provide: APP_INTERCEPTOR, useClass: LogRequestsInterceptor },
        LobbyService,
        PerformanceService,
        CounterService,
        PlayersService,
        TemplatesService,
        GamesService,
        GamesVService,
    ],
})
export class AppModule {}
