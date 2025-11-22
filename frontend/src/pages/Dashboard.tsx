import React, { useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';
import { WeatherLog } from '../types';
import { Download } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';

export function Dashboard() {
  const [logs, setLogs] = useState<WeatherLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Carregar dados quando componente monta
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await weatherService.getLogs('Cordeirópolis', 20);
      setLogs(response.data || []);
      setError('');
    } catch (err: any) {
      setError('Erro ao carregar dados climáticos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    weatherService.downloadCSV('Cordeirópolis');
  };

  const handleExportXLSX = () => {
    weatherService.downloadXLSX('Cordeirópolis');
  };

  return (
    <Layout>
      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Botões de exportação */}
        <div className="mb-6 flex gap-4">
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            <Download size={18} />
            Exportar CSV
          </Button>
          <Button onClick={handleExportXLSX}>
            <Download size={18} />
            Exportar XLSX
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabela de dados */}
        {!isLoading && logs.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Cidade
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Temperatura (°C)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Umidade (%)
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Condição
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Vento (km/h)
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{log.city}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      <span className="font-semibold">{log.temperature.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">{log.humidity}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">{log.condition}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {log.windSpeed.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sem dados */}
        {!isLoading && logs.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">Nenhum dado disponível</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
