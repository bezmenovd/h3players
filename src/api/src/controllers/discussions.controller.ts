import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { DiscussionsService } from '../services/discussions.service';
import { UserService } from '../services/user.service';
import { als } from '../als';
import { PermissionsService } from '../services/permissions.service';

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
    async add(@Req() req: Request, @Body('name') name: string) {
        let t = String(req.headers['token'])

        if (! t) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(t)

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
            await this.discussionsService.add(player, name, als.getStore()!.language)
        } catch (e: any) {
            throw new BadRequestException(e.message)
        }
        
        return
    }
}
