import { Controller, Get, Query } from '@nestjs/common';
import { CounterService } from '../../services/lobby/counter.service';

@Controller('lobby/counter')
export class CounterController {
  constructor(private readonly counterService: CounterService) {}
  @Get('/visitors')
  async visitors() {
    let visitors = await this.counterService.getVisitors()
    
    return {
      value: visitors
    }
  }

  @Get('/games')
  async games() {
    let games = await this.counterService.getGames()
    
    return {
      value: games
    }
  }
}
