import { BadRequestException, Body, Controller, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { als } from '../als';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly userService: UserService,
        private readonly reportsService: ReportsService,
    ) {}

    @Post('/add')
    async add(
        @Body('entity_type') entity_type: number,
        @Body('entity_id') entity_id: number,
        @Body('reason') reason: string,
    ) {
        const t = als.getStore()!.token

        if (! t) {
            throw new UnauthorizedException()
        }

        const player = await this.userService.getUserPlayer(t)

        if (! player) {
            throw new NotFoundException()
        }

        if (! entity_type || ! entity_id || reason.length < 3 || reason.length > 32) {
            throw new BadRequestException()
        }

        await this.reportsService.add(player, entity_type, entity_id, reason)
    }
}
