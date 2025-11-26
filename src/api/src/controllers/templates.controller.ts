import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
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
}
