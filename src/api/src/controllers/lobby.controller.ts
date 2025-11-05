import { Controller, Get, Query } from '@nestjs/common';
import { OnlineService } from '../services/online.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly onlineService: OnlineService) {}

  @Get('/onlineChart')
  async onlineChart(@Query('after') after?: number) {
    after = Math.max(after ?? 0, Math.floor(Date.now() / 1000) - 86400)

    let data = await this.onlineService.getOnlineChartData(after)

    return data
  }
}
