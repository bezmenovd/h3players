import { BadRequestException, Body, Controller, Get, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { als } from '../als';
import { PermissionsService } from '../services/permissions.service';
import { PlayersService } from '../services/players.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly playersService: PlayersService,
        private readonly permissionsService: PermissionsService,
    ) {}

    @Get('/me')
    async me() {
        const t = als.getStore()!.token

        if (! t) {
            throw new UnauthorizedException()
        }

        const player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new NotFoundException()
        }

        const permissions = await this.permissionsService.getPlayerPermissions(player)
        const restriction = await this.permissionsService.getRestriction(player)
        const blacklist = await this.userService.getBlacklist(player)

        return {
            id: player.id,
            name: player.name,
            permissions: permissions,
            restriction: restriction,
            blacklist: blacklist,
        }
    }

    @Post('/blacklist')
    async blacklist(
        @Body('target_id') target_id: number,
        @Body('add') add: boolean,
    ) {
        const t = als.getStore()!.token

        if (! t) {
            throw new UnauthorizedException()
        }

        const player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new NotFoundException()
        }

        if (! target_id || player.id === target_id) {
            throw new BadRequestException()
        }

        const target = await this.playersService.player(target_id)

        if (! target) {
            throw new NotFoundException()
        }
        
        if (add) {
            await this.userService.addToBlacklist(player, target)
        } else {
            await this.userService.removeFromBlacklist(player, target)
        }
    }
}
