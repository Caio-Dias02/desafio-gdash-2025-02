import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Anthropic } from '@anthropic-ai/sdk';
import {
  WeatherInsight,
  WeatherInsightDocument,
} from './schemas/weather-insight.schema';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class InsightsService {
  private anthropic: Anthropic;

  constructor(
    @InjectModel(WeatherInsight.name)
    private insightModel: Model<WeatherInsightDocument>,
    private weatherService: WeatherService,
    private configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    });
  }

  async generateInsight(city: string, days: number = 7) {
    // Busca dados climáticos
    const logs = await this.weatherService.findByCity(city, days);
    const stats = await this.weatherService.getStatistics(city, days);

    if (!logs || logs.length === 0) {
      return { error: 'Sem dados climáticos disponíveis' };
    }

    // Prepara dados para Claude
    const weatherData = {
      city,
      period: `últimos ${days} dias`,
      statistics: stats,
      recentData: logs.slice(0, 5).map((log) => ({
        date: log.timestamp,
        temp: log.temperature,
        humidity: log.humidity,
        condition: log.condition,
      })),
    };

    // Chama Claude API
    const prompt = `Analise os seguintes dados climáticos e forneça insights úteis:

${JSON.stringify(weatherData, null, 2)}

Forneça a resposta em formato JSON com os seguintes campos:
{
  "analysis": "análise textual dos dados em português",
  "alerts": ["lista de alertas se houver"],
  "recommendations": ["recomendações práticas baseadas no clima"]
}`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse resposta do Claude
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Extrai JSON da resposta
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const claudeResponse = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    // Salva insight no banco
    const insight = new this.insightModel({
      city,
      period: 'weekly',
      ...stats,
      analysis: claudeResponse.analysis || responseText,
      alerts: claudeResponse.alerts || [],
      recommendations: claudeResponse.recommendations || [],
      generatedAt: new Date(),
    });

    await insight.save();

    return insight;
  }

  async getLatestInsight(city: string) {
    return this.insightModel.findOne({ city }).sort({ generatedAt: -1 }).exec();
  }

  async getAllInsights(city?: string, limit: number = 10) {
    const query = city ? { city } : {};
    return this.insightModel
      .find(query)
      .sort({ generatedAt: -1 })
      .limit(limit)
      .exec();
  }
}
