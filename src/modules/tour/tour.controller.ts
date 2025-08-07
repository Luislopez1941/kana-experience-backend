import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TourService } from './tour.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ApiResponse } from './types/api-response.type';
import { Tour } from './entities/tour.entity';

@Controller('tours')
export class TourController {
  constructor(private readonly tourService: TourService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTourDto: CreateTourDto): Promise<ApiResponse<Tour>> {
    return this.tourService.create(createTourDto);
  }

  @Get('get-all')
  findAll(): Promise<ApiResponse<Tour[]>> {
    return this.tourService.findAll();
  }

  @Get('by-category/:tourCategoryId')
  getToursByCategory(@Param('tourCategoryId') tourCategoryId: string): Promise<ApiResponse<Tour[]>> {
    return this.tourService.getToursByCategory(+tourCategoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tourService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto): Promise<ApiResponse<Tour>> {
    return this.tourService.update(+id, updateTourDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tourService.remove(+id);
  }
} 