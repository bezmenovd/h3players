import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../services/user.service';
import { PostsService } from '../services/posts.service';
import { PostWithInfo } from '../types/mysql/h3players';
import { PermissionsService } from '../services/permissions.service';
import { als } from '../als';

@Controller('posts')
export class PostsController {
    constructor(
        private readonly userService: UserService,
        private readonly postsService: PostsService,
        private readonly permissonsService: PermissionsService,
    ) {}

    @Get('/')
    async getList(@Query('discussionId') discussionId?: number) {
        let dId = Number(discussionId)

        let posts: PostWithInfo[] = []
        
        if (Number.isFinite(dId)) {
            posts = await this.postsService.getDiscussionPostsList(dId)
        } else {
            posts = await this.postsService.getList()
        }

        return posts
    }

    @Post('/add')
    async add(
        @Body('title') title: string, 
        @Body('text') text: string, 
        @Body('discussion_id') discussion_id: number
    ) {
        if (! title || ! text || ! discussion_id) {
            throw new BadRequestException()
        }
        
        if (! als.getStore()!.token) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(als.getStore()!.token)

        if (! player) {
            throw new UnauthorizedException()
        }

        if (await this.permissonsService.getRestriction(player) !== null) {
            throw new ForbiddenException('restricted')
        }

        try {
            return await this.postsService.addPost(player, title, text, discussion_id)
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
    }
}
