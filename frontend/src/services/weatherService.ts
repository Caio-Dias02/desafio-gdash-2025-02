import api from './api';
import { WeatherLog, WeatherStats } from '../types';

export const weatherService = {
  // Listar logs climáticos com filtros
  async getLogs(city?: string, limit: number = 100, skip: number = 0): Promise<WeatherLog[]> {
    const response = await api.get<WeatherLog[]>('/weather/logs', {
      params: { city, limit, skip },
    });
    return response.data;
  },

  // Pegar estatísticas de uma cidade
  async getStatistics(city: string, days: number = 7): Promise<WeatherStats> {
    const response = await api.get<WeatherStats>(`/weather/statistics/${city}`, {
      params: { days },
    });
    return response.data;
  },

  // Gerar insights IA sobre clima
  async generateInsights(city: string, days: number = 7): Promise<string> {
    const response = await api.post<{ insight: string }>(
      `/weather/insights/generate/${city}`,
      { days }
    );
    return response.data.insight;
  },

  // Listar insights gerados
  async getInsights(city?: string, limit: number = 10): Promise<any[]> {
    const response = await api.get('/weather/insights', {
      params: { city, limit },
    });
    return response.data;
  },

  // Exportar em CSV
  downloadCSV(city?: string): void {
    const url = `/weather/export/csv${city ? `?city=${city}` : ''}`;
    window.location.href = api.defaults.baseURL + url;
  },

  // Exportar em XLSX
  downloadXLSX(city?: string): void {
    const url = `/weather/export/xlsx${city ? `?city=${city}` : ''}`;
    window.location.href = api.defaults.baseURL + url;
  },
};
