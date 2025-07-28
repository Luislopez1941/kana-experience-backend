import { Module } from '@nestjs/common';
import { YachtTypeService } from './yacht-type.service';
import { YachtTypeController } from './yacht-type.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { YachtService } from '../yacht/yacht.service';

@Module({
  imports: [PrismaModule],
  controllers: [YachtTypeController],
  providers: [YachtTypeService, YachtService],
  exports: [YachtTypeService],
})
export class YachtTypeModule {} 