import { Controller, Get, Query } from '@nestjs/common';
import { GamesVService } from '../services/games_v.service';


@Controller('games_v')
export class GamesVController {
    constructor(private readonly gamesVService: GamesVService) {}

    @Get('/')
    async list(
        @Query('playerId') playerId?: string,
        @Query('limit') limit?: string, 
        @Query('offset') offset?: string,
    ) {
        let p = Number(playerId)
        let l = Number(limit) || 100000
        let o = Number(offset) || 0

        let data = await this.gamesVService.getList(p, l, o)

        return data
    }
}
