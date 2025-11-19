import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherInsightDocument = WeatherInsight & Document;

@Schema({ timestamps: true })
export class WeatherInsight {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  period: string; // "daily", "weekly", "monthly"

  // Estatísticas calculadas
  @Prop({ type: Number })
  avgTemperature: number;

  @Prop({ type: Number })
  avgHumidity: number;

  @Prop({ type: Number })
  avgWindSpeed: number;

  @Prop({ type: Number })
  maxTemperature: number;

  @Prop({ type: Number })
  minTemperature: number;

  // Análise textual do Claude
  @Prop({ required: true })
  analysis: string; // Texto gerado pelo Claude

  @Prop({ type: [String] })
  alerts: string[]; // ["Calor extremo", "Chuva iminente"]

  @Prop({ type: [String] })
  recommendations: string[]; // Recomendações baseadas no clima

  @Prop({ required: true })
  generatedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WeatherInsightSchema =
  SchemaFactory.createForClass(WeatherInsight);

// Índices
WeatherInsightSchema.index({ city: 1, generatedAt: -1 });
WeatherInsightSchema.index({ generatedAt: -1 });
