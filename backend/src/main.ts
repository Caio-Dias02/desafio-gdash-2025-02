import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS - permite requisições do frontend
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Validação global - garante que dados enviados são válidos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation - documenta a API automaticamente
  const config = new DocumentBuilder()
    .setTitle('GDASH API')
    .setDescription('API para monitoramento climático com insights de IA')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Local')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
