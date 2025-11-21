import { IsString, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateWeatherLogDto {
  @IsString({ message: 'Cidade deve ser uma string' })
  city: string;

  @IsNumber()
  temperature: number; // em Celsius

  @IsNumber()
  @Min(0, { message: 'Umidade deve estar entre 0 e 100' })
  @Max(100, { message: 'Umidade deve estar entre 0 e 100' })
  humidity: number; // percentual 0-100

  @IsNumber()
  windSpeed: number; // em km/h

  @IsString({ message: 'Condição deve ser uma string' })
  condition: string; // "Sunny", "Rainy", "Cloudy", etc

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Chance de chuva deve estar entre 0 e 100' })
  @Max(100, { message: 'Chance de chuva deve estar entre 0 e 100' })
  rainChance?: number; // percentual 0-100

  @IsOptional()
  @IsNumber()
  pressure?: number; // hPa

  @IsOptional()
  @IsNumber()
  visibility?: number; // metros

  @IsDateString()
  timestamp: string; // quando foi coletado (ISO 8601)
}
