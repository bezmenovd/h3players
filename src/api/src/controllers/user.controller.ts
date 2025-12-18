import { Controller, Get, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { als } from '../als';
import { PermissionsService } from '../services/permissions.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly permissionsService: PermissionsService,
    ) {}

    @Get('/me')
    async me() {
        let t = als.getStore()!.token

        if (! t) {
            throw new UnauthorizedException()
        }

        let player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new NotFoundException()
        }

        let permissions = await this.permissionsService.getPlayerPermissions(player)
        let restriction = await this.permissionsService.getRestriction(player)

        return {
            id: player.id,
            name: player.name,
            permissions: permissions,
            restriction: restriction,
        }
    }
}
