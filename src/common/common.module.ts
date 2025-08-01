import { Module, Global } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class CommonModule {} 