import { Module } from '@nestjs/common';
import { YachtService } from './yacht.service';
import { YachtController } from './yacht.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [YachtController],
  providers: [YachtService],
  exports: [YachtService],
})
export class YachtModule {}
