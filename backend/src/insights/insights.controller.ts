import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/weather/insights')
export class InsightsController {
  constructor(private insightsService: InsightsService) {}

  @Post('generate/:city')
  @UseGuards(JwtAuthGuard)
  async generateInsight(
    @Param('city') city: string,
    @Query('days') days: number = 7,
  ) {
    return this.insightsService.generateInsight(city, days);
  }

  @Get('latest/:city')
  @UseGuards(JwtAuthGuard)
  async getLatestInsight(@Param('city') city: string) {
    return this.insightsService.getLatestInsight(city);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllInsights(
    @Query('city') city?: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.insightsService.getAllInsights(city, limit);
  }
}
