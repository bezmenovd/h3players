import { Controller, Get, Post, Query } from '@nestjs/common';

@Controller('functions')
export class FunctionsController {
    @Post('/logError')
    async logError() {
    }
}
