import { Module } from '@nestjs/common';
import { LobbyController } from './controllers/lobby.controller';
import { OnlineService } from './services/online.service';
import { PlayersController } from './controllers/players.controller';
import { PlayersService } from './services/players.service';

@Module({
  imports: [],
  controllers: [
    LobbyController, 
    PlayersController,
  ],
  providers: [
    OnlineService, 
    PlayersService
  ],
})
export class AppModule {}
