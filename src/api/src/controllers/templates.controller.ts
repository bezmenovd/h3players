import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { TemplatesService } from '../services/templates.service';

@Controller('templates')
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) {}

    @Get('/')
    async list(@Query('limit') limit?: string, @Query('offset') offset?: string, @Query('ids') ids?: string) {
        let l = Math.min(Number(limit) || 30, 100)
        let o = Number(offset) || 0
        let i = String(ids).split(',').map(id => parseInt(id)).filter(e => e) || []

        let data = await this.templatesService.getList(l, o, i)

        return data
    }

    @Get('/search')
    async search(@Query('query') query: string, @Query('limit') limit?: string) {
        if (query.length === 0) {
            return []
        }

        let q = query.replace(/[^a-zA-Z0-9_ \-=@.!#$%^&*]/g, '').toUpperCase()
        let l = Math.min(Number(limit) || 10, 100)
        
        let data = await this.templatesService.search(q, l)

        return data
    }
}
