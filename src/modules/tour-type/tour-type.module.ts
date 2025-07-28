import { Module } from '@nestjs/common';
import { TourTypeService } from './tour-type.service';
import { TourTypeController } from './tour-type.controller';

@Module({
  controllers: [TourTypeController],
  providers: [TourTypeService],
  exports: [TourTypeService],
})
export class TourTypeModule {} 