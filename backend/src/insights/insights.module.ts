import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import {
  WeatherInsight,
  WeatherInsightSchema,
} from './schemas/weather-insight.schema';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherInsight.name, schema: WeatherInsightSchema },
    ]),
    WeatherModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
