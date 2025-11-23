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

  @Get('/lastGames')
  async lastGames() {
    let items = await this.lobbyService.getLastGames()
    
    return items
  }

  @Get('/dailyTop')
  async dailyTop(@Query('limit') limit: number) {
    let l = Math.min(Number(limit) || 10, 128)

    let byRating = await this.lobbyService.getDailyTopByRating(l)
    let byRatingAnti = await this.lobbyService.getDailyTopByRating(l, true)
    let byGamesCount = await this.lobbyService.getDailyTopByGamesCount(l)
    
    return {
      byRating,
      byRatingAnti,
      byGamesCount,
    }
  }
}
