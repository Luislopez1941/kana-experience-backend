import { Module } from '@nestjs/common';
import { ClubTypeService } from './club-type.service';
import { ClubTypeController } from './club-type.controller';

@Module({
  controllers: [ClubTypeController],
  providers: [ClubTypeService],
  exports: [ClubTypeService],
})
export class ClubTypeModule {} 