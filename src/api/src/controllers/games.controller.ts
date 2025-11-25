import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from '../services/games.service';


@Controller('games')
export class GamesController {
    constructor(private readonly gamesService: GamesService) {}

    @Get('/')
    async list(
        @Query('limit') limit?: string, 
        @Query('offset') offset?: string,
        @Query('date') date?: string,
    ) {
        let l = Math.min(Number(limit) || 1000, 1000)
        let o = Number(offset) || 0

        let list = await this.gamesService.getList(l, o)

        return list
    }
}
