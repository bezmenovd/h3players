import { BadRequestException, Controller, Get, NotFoundException, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    async me(@Req() req: Request) {
        let t = String(req.headers['token'])

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
