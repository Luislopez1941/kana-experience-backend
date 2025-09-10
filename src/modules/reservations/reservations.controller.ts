import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post('create')
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get('get-all')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('by-product/:productId/:type')
  findByProduct(@Param('productId') productId: string, @Param('type') type: string) {
    return this.reservationsService.findByProductId(+productId, type);
  }

  @Get('by-status/:status')
  findByStatus(@Param('status') status: string) {
    return this.reservationsService.findByStatus(status);
  }

  @Get('by-email')
  findByEmail(@Query('email') email: string) {
    return this.reservationsService.findByEmail(email);
  }

  @Get('by-folio/:folio')
  findByFolio(@Param('folio') folio: string) {
    return this.reservationsService.findByFolio(folio);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(+id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(+id);
  }
}
