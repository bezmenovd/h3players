import { BadRequestException, Body, Controller, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { PostsService } from '../services/posts.service';
import { PostWithInfo } from '../types/mysql/h3players';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly userService: UserService,
        private readonly postsService: PostsService,
    ) {}

    @Get('/')
    async getList(@Query('discussionId') discussionId?: number) {
        let dId = Number(discussionId)

        let posts: PostWithInfo[] = []
        
        if (Number.isFinite(dId)) {
            posts = await this.postsService.getDiscussionPostsList(dId)
        } else {
            posts = await this.postsService.getDiscussionPostsList(dId)
        }

        return posts
    }

    @Post('/add')
    async add(@Req() req: Request, @Body('title') title: string, @Body('text') text: string) {
        let t = String(req.headers['token'])

        if (! t) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new UnauthorizedException()
        }


    }
}
