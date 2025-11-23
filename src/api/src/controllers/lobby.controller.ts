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

  @Get('/dailyGames')
  async dailyGames(@Query('offset') offset?: number, @Query('limit') limit?: number) {
    let o = Number(offset) || 0
    let l = Math.min(Number(limit) || 10, 100)

    let r = await this.lobbyService.getDailyGames(l, o)
    
    return r
  }

  @Get('/dailyTop')
  async dailyTop(@Query('offset') offset?: number, @Query('limit') limit?: number) {
    let o = Number(offset) || 0
    let l = Math.min(Number(limit) || 10, 100)

    let byRating = await this.lobbyService.getDailyTopByRating(l, o)
    let byRatingAnti = await this.lobbyService.getDailyTopByRating(l, o, true)
    let byGamesCount = await this.lobbyService.getDailyTopByGamesCount(l, o)
    
    return {
      byRating,
      byRatingAnti,
      byGamesCount,
    }
  }
}
