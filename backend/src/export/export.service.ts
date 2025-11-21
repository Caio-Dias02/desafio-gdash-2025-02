import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from '../weather/schemas/weather-log.schema';
import * as xlsx from 'xlsx';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLog>,
  ) {}

  async generateCSV(city?: string): Promise<string> {
    // 1. Buscar dados do banco
    const query = city ? { city } : {};
    const logs = await this.weatherLogModel.find(query).sort({ timestamp: -1 });

    // 2. Se não tiver dados, retorna CSV vazio com headers
    if (!logs || logs.length === 0) {
      return this.formatCSVHeaders();
    }

    // 3. Converte array de logs para CSV
    const csvHeaders = 'Data,Hora,Cidade,Temperatura (°C),Umidade (%),Vento (km/h),Condição,Chance Chuva (%),Pressão (hPa),Visibilidade (m)\n';
    const csvRows = logs.map(log => {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString('pt-BR');
      const timeStr = date.toLocaleTimeString('pt-BR');

      return [
        dateStr,
        timeStr,
        this.escapeCSV(log.city),
        log.temperature?.toFixed(2) || '',
        log.humidity?.toString() || '',
        log.windSpeed?.toFixed(2) || '',
        this.escapeCSV(log.condition),
        log.rainChance?.toString() || '',
        log.pressure?.toString() || '',
        log.visibility?.toString() || '',
      ].join(',');
    }).join('\n');

    return csvHeaders + csvRows;
  }

  async generateXLSX(city?: string): Promise<Buffer> {
    // 1. Buscar dados do banco
    const query = city ? { city } : {};
    const logs = await this.weatherLogModel.find(query).sort({ timestamp: -1 });

    // 2. Converter logs para formato de planilha
    const data = logs.map(log => {
      const date = new Date(log.timestamp);
      return {
        Data: date.toLocaleDateString('pt-BR'),
        Hora: date.toLocaleTimeString('pt-BR'),
        Cidade: log.city,
        'Temperatura (°C)': log.temperature?.toFixed(2) || '',
        'Umidade (%)': log.humidity || '',
        'Vento (km/h)': log.windSpeed?.toFixed(2) || '',
        Condição: log.condition,
        'Chance Chuva (%)': log.rainChance || '',
        'Pressão (hPa)': log.pressure || '',
        'Visibilidade (m)': log.visibility || '',
      };
    });

    // 3. Criar workbook (arquivo Excel)
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dados Climáticos');

    // 4. Ajustar largura das colunas
    worksheet['!cols'] = [
      { wch: 12 }, // Data
      { wch: 12 }, // Hora
      { wch: 15 }, // Cidade
      { wch: 16 }, // Temperatura
      { wch: 12 }, // Umidade
      { wch: 14 }, // Vento
      { wch: 15 }, // Condição
      { wch: 15 }, // Chance Chuva
      { wch: 14 }, // Pressão
      { wch: 15 }, // Visibilidade
    ];

    // 5. Converter workbook para buffer (bytes)
    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }

  private escapeCSV(value: string): string {
    // Escapa aspas duplas e envolve em aspas se houver vírgula
    if (value.includes(',') || value.includes('"')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatCSVHeaders(): string {
    return 'Data,Hora,Cidade,Temperatura (°C),Umidade (%),Vento (km/h),Condição,Chance Chuva (%),Pressão (hPa),Visibilidade (m)\n';
  }
}
