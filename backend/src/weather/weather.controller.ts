import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateWeatherLogDto } from './dtos/create-weather-log.dto';

@Controller('api/weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Post('logs')
  async createLog(@Body() weatherData: CreateWeatherLogDto) {
    return this.weatherService.create(weatherData);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  async getLogs(
    @Query('city') city?: string,
    @Query('limit') limit: number = 100,
    @Query('skip') skip: number = 0,
  ) {
    return this.weatherService.findAll(city, limit, skip);
  }

  @Get('statistics/:city')
  @UseGuards(JwtAuthGuard)
  async getStatistics(
    @Param('city') city: string,
    @Query('days') days: number = 7,
  ) {
    return this.weatherService.getStatistics(city, days);
  }
}
