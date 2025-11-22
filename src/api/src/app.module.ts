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

@Module({
  imports: [],
  controllers: [
    LobbyController,
    PlayersController,
    GamesController,
    PerformanceController,
    FunctionsController,
  ],
  providers: [
    LobbyService,
    PlayersService,
    GamesService,
    PerformanceService,
  ],
})
export class AppModule {}
