import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from '../services/games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/')
  async list(
    @Query('playerId') playerId?: string,
    @Query('limit') limit?: string, 
    @Query('offset') offset?: string,
  ) {
    let p = Number(playerId)
    let l = Math.min(Number(limit) || 65536, 65536)
    let o = Number(offset) || 0

    let data = await this.gamesService.getList(p, l, o)

    return data
  }
}
