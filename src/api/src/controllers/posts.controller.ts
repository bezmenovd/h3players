import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
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
    async getList(
        @Query('discussionId') discussionId?: number,
        @Query('sort') sort?: string,
        @Query('query') query?: string,
    ) {
        let dId = Number(discussionId)

        let posts: PostWithInfo[] = []
        
        if (Number.isFinite(dId)) {
            posts = await this.postsService.getDiscussionPostsList(dId, sort, query)
        } else {
            posts = await this.postsService.getList(sort, query)
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

    @Post('/add_message')
    async addMessage(
        @Body('post_id') post_id: number,
        @Body('parent_id') parent_id: number|null,
        @Body('text') text: string,
    ) {
        if (! post_id || ! text) {
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
            return await this.postsService.addMessage(player, post_id, parent_id, text)
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
    }

    @Post('/:id/register_view')
    async registerView(
        @Param('id') id: number,
    ) {
        if (! id) {
            throw new BadRequestException()
        }
        
        if (! als.getStore()!.token) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(als.getStore()!.token)

        if (! player) {
            throw new UnauthorizedException()
        }

        await this.postsService.registerView(player, id)
    }

    @Post('/vote')
    async vote(
        @Body('entity_type') entity_type: number,
        @Body('entity_id') entity_id: number,
        @Body('type') type: number,
    ) {
        if (! [2,3].includes(entity_type) || ! entity_id || ! [1,2].includes(type)) {
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

        await this.postsService.vote(player, entity_type, entity_id, type)
    }

    @Get('/by_slug/:slug')
    async getBySlug(@Param('slug') slug: string) {
        if (!slug) {
            throw new BadRequestException();
        }

        const post = await this.postsService.getBySlug(slug)

        if (! post) {
            throw new NotFoundException()
        }

        return post
    }
}
