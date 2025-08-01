import { Module } from '@nestjs/common';
import { TourService } from './tour.service';
import { TourController } from './tour.controller';

@Module({
  controllers: [TourController],
  providers: [TourService],
  exports: [TourService],
})
export class TourModule {} 