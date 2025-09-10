import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { CommonModule } from '../../common/common.module';
import { FolioModule } from '../folio/folio.module';

@Module({
  imports: [CommonModule, FolioModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}