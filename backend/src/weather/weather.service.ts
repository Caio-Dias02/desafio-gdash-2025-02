import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dtos/create-weather-log.dto';
@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(weatherData: CreateWeatherLogDto): Promise<WeatherLog> {
    const newLog = new this.weatherLogModel({
      ...weatherData,
      timestamp: weatherData.timestamp || new Date(),
    });
    return newLog.save();
  }

  async findAll(
    city?: string,
    limit: number = 100,
    skip: number = 0,
  ): Promise<{ data: WeatherLog[]; total: number }> {
    const query = city ? { city } : {};

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .exec(),
      this.weatherLogModel.countDocuments(query),
    ]);

    return { data, total };
  }

  async findByCity(
    city: string,
    days: number = 7,
  ): Promise<WeatherLog[]> {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);

    return this.weatherLogModel
      .find({
        city,
        timestamp: { $gte: pastDate },
      })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getStatistics(city: string, days: number = 7) {
    const logs = await this.findByCity(city, days);

    if (logs.length === 0) {
      return null;
    }

    const temperatures = logs.map((log) => log.temperature);
    const humidities = logs.map((log) => log.humidity);
    const windSpeeds = logs.map((log) => log.windSpeed);

    return {
      avgTemperature:
        temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      maxTemperature: Math.max(...temperatures),
      minTemperature: Math.min(...temperatures),
      avgHumidity: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      avgWindSpeed:
        windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
      dataPoints: logs.length,
    };
  }
}
