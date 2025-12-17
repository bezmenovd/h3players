import { BadRequestException, Body, Controller, Get, Headers, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { DiscussionsService } from '../services/discussions.service';
import { UserService } from '../services/user.service';
import { Discussion } from '../types/mysql/h3players';

@Controller('discussions')
export class DiscussionsController {
    constructor(
        private readonly userService: UserService,
        private readonly discussionsService: DiscussionsService,
    ) {}

    @Get('/')
    async getList() {
        let discussions = await this.discussionsService.getList()

        return discussions
    }

    @Post('/add')
    async add(@Req() req: Request, @Body('name') name: string, @Headers('Language') language?: string) {
        let t = String(req.headers['token'])

        if (! t) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new UnauthorizedException()
        }

        let userLanguage = Number(language)
        if (! Number.isFinite(userLanguage)) {
            userLanguage = 2
        }

        let discussion: Discussion

        try {
            discussion = await this.discussionsService.add(player, name, userLanguage)
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
        
        return discussion
    }
}
