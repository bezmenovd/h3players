import { Module } from '@nestjs/common';
import { LobbyController } from './controllers/lobby.controller';
import { PerformanceController } from './controllers/performance.controller';
import { LobbyService } from './services/lobby.service';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { PerformanceService } from './services/performance.service';
import { FunctionsController } from './controllers/functions.controller';
import { GamesController } from './controllers/games.controller';
import { GamesService } from './services/games.service';
import { CounterController } from './controllers/lobby/counter.controller';
import { CounterService } from './services/lobby/counter.service';

@Module({
  imports: [],
  controllers: [
    LobbyController,
    CounterController,
    PlayersController,
    GamesController,
    PerformanceController,
    FunctionsController,
  ],
  providers: [
    LobbyService,
    CounterService,
    PlayersService,
    GamesService,
    PerformanceService,
  ],
})
export class AppModule {}
