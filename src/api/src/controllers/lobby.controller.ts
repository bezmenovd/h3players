import { Controller, Get, Query } from '@nestjs/common';
import { LobbyService } from '../services/lobby.service';

@Controller('lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Get('/chart')
  async chart(@Query('after') after?: number) {
    let a = Math.round(Math.max(Number(after) || 0, Math.floor(Date.now() / 1000) - 86400*2))

    let data = await this.lobbyService.getChartData(a)

    return data
  }
}
