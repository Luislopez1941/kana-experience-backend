import { Controller, Get, Param } from '@nestjs/common';
import { FolioService } from './folio.service';

@Controller('folio')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  @Get('generate')
  generateFolio() {
    return this.folioService.generateFolio();
  }

  @Get(':folio')
  getFolioByNumber(@Param('folio') folio: string) {
    return this.folioService.getFolioByNumber(parseInt(folio));
  }
}
