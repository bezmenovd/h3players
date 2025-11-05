import { Controller, Get, Query } from '@nestjs/common';
import { OnlineService } from '../services/online.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly onlineService: OnlineService) {}

  @Get('/online')
  async online(@Query('after') after?: number) {
    let online = await this.onlineService.getOnline(after ?? Math.floor(Date.now() / 1000) - 86400)

    return {
      online,
    }
  }
}
