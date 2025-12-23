import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { TemplatesService } from '../services/templates.service';
import { DiscussionsService } from '../services/discussions.service';
import { PostsService } from '../services/posts.service';


@Controller('templates')
export class TemplatesController {
    constructor(
        private readonly templatesService: TemplatesService,
        private readonly discussionsService: DiscussionsService,
        private readonly postsService: PostsService,
    ) {}

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
        let ids = [template.id].concat(versions.map(v => v.id))

        let stats = await this.templatesService.getStats(template.name)
        let firstGame = await this.templatesService.getFirstGame(ids)
        let chartGames = await this.templatesService.getGamesChart(ids)
        let chartDuration = await this.templatesService.getDurationChart(ids)
        let chartEndDay = await this.templatesService.getEndDayChart(ids)

        let discussion = await this.discussionsService.getTemplateDiscussion(ids.sort((a, b) => a - b)[0])
        let postsCount = await this.postsService.getPostsCount(discussion.id)

        return {
            template,
            versions,
            stats,
            first_game: firstGame,
            charts: {
                games: chartGames,
                duration: chartDuration,
                end_day: chartEndDay,
            },
            discussion: {
                posts_count: postsCount,
            },
        }
    }
    
        @Get('/:id/discussion')
        async getTemplateDiscussion(
            @Param('id') id: string,
        ) {
            let tid = Number(id)
    
            if (! tid) {
                throw new BadRequestException()
            }
    
            let template = await this.templatesService.getTemplate(tid)
    
            if (! template) {
                throw new NotFoundException()
            }
    
            let discussion = await this.discussionsService.getTemplateDiscussion(template.id)
    
            return {
                template_name: template.name,
                discussion_id: discussion.id,
            }
        }
}
