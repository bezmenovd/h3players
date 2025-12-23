import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { DiscussionsService } from '../services/discussions.service';
import { UserService } from '../services/user.service';
import { PermissionsService } from '../services/permissions.service';
import { als } from '../als';

@Controller('discussions')
export class DiscussionsController {
    constructor(
        private readonly userService: UserService,
        private readonly discussionsService: DiscussionsService,
        private readonly permissonsService: PermissionsService,
    ) {}

    @Get('/')
    async getList() {
        let discussions = await this.discussionsService.getList()

        return discussions
    }

    @Post('/add')
    async add(@Body('name') name: string) {
        if (! name) {
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
        if (! await this.permissonsService.authorize(player, 'discussions.add')) {
            throw new ForbiddenException('no_permission')
        }

        try {
            return await this.discussionsService.add(player, name)
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
    }
}
