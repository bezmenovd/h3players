import { Controller, Get, Query } from '@nestjs/common';
import { PerformanceService } from '../services/performance.service';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get('/chart')
  async chart(@Query('after') after?: number) {
    let a = Math.round(Math.max(Number(after) || 0, Math.floor(Date.now() / 1000) - 86400*2))

    let data = await this.performanceService.getStatistics(a)

    return data
  }
}
