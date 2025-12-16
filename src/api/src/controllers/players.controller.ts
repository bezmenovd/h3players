import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PlayersService } from '../services/players.service';

@Controller('players')
export class PlayersController {
    constructor(private readonly playersService: PlayersService) {}

    @Get('/')
    async list(@Query('limit') limit?: string, @Query('offset') offset?: string, @Query('ids') ids?: string) {
        let l = Math.min(Number(limit) || 30, 100)
        let o = Number(offset) || 0
        let i = String(ids).split(',').map(id => parseInt(id)).filter(e => e) || []

        let data = await this.playersService.getList(l, o, i)

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

    @Get(':id')
    async info(@Param('id') id: string) {
        const i = Number(id)

        if (! i) {
            return {}
        }

        let player = await this.playersService.player(i)

        if (! player) {
            throw new NotFoundException()
        }

        let rank = await this.playersService.playerRank(i)

        let rating = await this.playersService.playerRating(i)

        return {
            id: player.id,
            name: player.name,
            rank: rank,
            rating: rating,
        }
    }
}
