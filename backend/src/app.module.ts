import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WeatherModule } from './weather/weather.module';
import { InsightsModule } from './insights/insights.module';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    // Carrega variáveis de .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conecta ao MongoDB usando string de conexão do .env
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),

    // Módulos da aplicação
    AuthModule,
    UsersModule,
    WeatherModule,
    InsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    // Cria usuário padrão na inicialização
    await this.usersService.seedDefaultUser();
  }
}
