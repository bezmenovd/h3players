import { BadRequestException, Controller, Get, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Request } from 'express';
import { als } from '../als';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    async me() {
        let t = als.getStore()!.token

        if (! t) {
            throw new UnauthorizedException()
        }

        let player = this.userService.getUserPlayer(t)

        if (! player) {
            throw new NotFoundException()
        }

        return player
    }
}
