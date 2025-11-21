import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('api/weather/export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('csv')
  async exportCSV(
    @Res() res: Response,
    @Query('city') city?: string,
  ) {
    // 1. Chamar o service para gerar CSV
    const csv = await this.exportService.generateCSV(city);

    // 2. Configurar headers HTTP para download
    const filename = city
      ? `clima-${city.toLowerCase()}-${Date.now()}.csv`
      : `clima-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // 3. Enviar arquivo para o cliente
    return res.send(csv);
  }

  @Get('xlsx')
  async exportXLSX(
    @Res() res: Response,
    @Query('city') city?: string,
  ) {
    // 1. Chamar o service para gerar XLSX
    const buffer = await this.exportService.generateXLSX(city);

    // 2. Configurar headers HTTP para download
    const filename = city
      ? `clima-${city.toLowerCase()}-${Date.now()}.xlsx`
      : `clima-${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // 3. Enviar arquivo para o cliente
    return res.send(buffer);
  }
}
