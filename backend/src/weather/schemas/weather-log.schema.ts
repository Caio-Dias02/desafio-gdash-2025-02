import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true, type: Number })
  temperature: number; // em Celsius

  @Prop({ required: true, type: Number })
  humidity: number; // percentual 0-100

  @Prop({ required: true, type: Number })
  windSpeed: number; // em km/h

  @Prop({ required: true })
  condition: string; // "Sunny", "Rainy", "Cloudy", etc

  @Prop({ type: Number })
  rainChance: number; // percentual 0-100

  @Prop({ type: Number })
  pressure: number; // hPa

  @Prop({ type: Number })
  visibility: number; // metros

  @Prop({ required: true })
  timestamp: Date; // quando foi coletado

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

// Índices para buscas rápidas
WeatherLogSchema.index({ city: 1, timestamp: -1 });
WeatherLogSchema.index({ timestamp: -1 });
