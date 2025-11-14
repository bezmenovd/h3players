import { Controller, Get, Query } from '@nestjs/common';
import { PlayersService } from '../services/players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('/')
  async list(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    let l = Math.min(Number(limit) || 30, 100)
    let o = Number(offset) || 0

    let data = await this.playersService.getList(l, o)

    return data
  }

  @Get('/search')
  async search(@Query('query') query: string, @Query('limit') limit?: string) {
    if (query.length === 0) {
      return []
    }

    let q = query.replace(/[^a-zA-Z0-9_ \-=@.!#$%^&*]/g, '').toUpperCase()
    let l = Math.min(Number(limit) || 10, 100)
    
    let data = await this.playersService.search(q, l)

    return data
  }
}
