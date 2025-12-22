import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { TemplatesService } from '../services/templates.service';


@Controller('templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) {}

    @Get('/')
    async list(
        @Query('limit') limit?: string, 
        @Query('offset') offset?: string, 
        @Query('ids') ids?: string,
        @Query('query') query?: string,
    ) {
        let l = Math.min(Number(limit) || 30, 100)
        let o = Number(offset) || 0
        let i = String(ids).split(',').map(id => parseInt(id)).filter(e => e) || []
        let q = query ? String(query).replace(/[^a-zA-Z0-9_ \-=@.!#$%^&*]/g, '').toUpperCase() : ''

        let data = await this.templatesService.getList(l, o, i, q)

        return data
    }

    @Get('/statistics')
    async statistics(
        @Query('offset') offset?: string,
    ) {
        let o = Number.isFinite(Number(offset)) && Number(offset) > 0 ? Math.min(Number(offset), 100) : 0

        let data = await this.templatesService.getStatistics(o)

        return data
    }

    @Get('/:id')
    async get(
        @Param('id') id?: string
    ) {
        let i = Number(id)

        if (! Number.isFinite(i)) {
            throw new BadRequestException()
        }

        let template = await this.templatesService.getTemplate(i)
        if (! template) {
            throw new NotFoundException()
        }

        let versions = await this.templatesService.getVersions(template.name)
        let stats = await this.templatesService.getStats(template.name)
        let chartGames = await this.templatesService.getGamesChart([template.id].concat(versions.map(v => v.id)))
        let chartDuration = await this.templatesService.getDurationChart([template.id].concat(versions.map(v => v.id)))
        let chartEndDay = await this.templatesService.getEndDayChart([template.id].concat(versions.map(v => v.id)))

        return {
            template,
            versions,
            stats,
            charts: {
                games: chartGames,
                duration: chartDuration,
                end_day: chartEndDay,
            },
        }
    }
}
