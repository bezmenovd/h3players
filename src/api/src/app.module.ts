import { Module } from '@nestjs/common';
import { LobbyController } from './controllers/lobby.controller';
import { PerformanceController } from './controllers/performance.controller';
import { LobbyService } from './services/lobby.service';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';
import { PerformanceService } from './services/performance.service';
import { FunctionsController } from './controllers/functions.controller';

@Module({
  imports: [],
  controllers: [
    LobbyController,
    PlayersController,
    PerformanceController,
    FunctionsController,
  ],
  providers: [
    LobbyService,
    PlayersService,
    PerformanceService,
  ],
})
export class AppModule {}
