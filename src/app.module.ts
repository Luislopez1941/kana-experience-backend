import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { YachtModule } from './modules/yacht/yacht.module';
import { YachtTypeModule } from './modules/yacht-type/yacht-type.module';
import { TourModule } from './modules/tour/tour.module';
import { TourTypeModule } from './modules/tour-type/tour-type.module';
import { StateModule } from './modules/state/state.module';
import { MunicipalityModule } from './modules/municipality/municipality.module';
import { ClubModule } from './modules/club/club.module';
import { ClubTypeModule } from './modules/club-type/club-type.module';
import { PrismaModule } from './prisma/prisma.module';
import { LocalitiesModule } from './modules/localities/localities.module';
import { CommonModule } from './common/common.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    CommonModule, // Agregar CommonModule para SupabaseService
    PrismaModule,
    UserModule,
    AuthModule,
    YachtModule,
    YachtTypeModule,
    TourModule,
    TourTypeModule,
    StateModule,
    MunicipalityModule,
    ClubModule,
    ClubTypeModule,
    LocalitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
