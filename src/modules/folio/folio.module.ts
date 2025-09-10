import { Module } from '@nestjs/common';
import { FolioService } from './folio.service';
import { FolioController } from './folio.controller';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [FolioController],
  providers: [FolioService, PrismaService],
  exports: [FolioService],
})
export class FolioModule {}
