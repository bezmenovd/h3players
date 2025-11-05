import { Module } from '@nestjs/common';
import { LobbyController } from './controllers/lobby.controller';
import { OnlineService } from './services/online.service';

@Module({
  imports: [],
  controllers: [LobbyController],
  providers: [OnlineService],
})
export class AppModule {}
