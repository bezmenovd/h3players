import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/me')
    async me() {
        
    }
}
