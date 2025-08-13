import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { TourTypeService, FilterTourCategoriesDto } from './tour-type.service';
import { CreateTourTypeDto } from './dto/create-tour-type.dto';
import { UpdateTourTypeDto } from './dto/update-tour-type.dto';
import { ApiResponse } from './types/api-response.type';
import { TourType } from './entities/tour-type.entity';

@Controller('tour-types')
export class TourTypeController {
  constructor(private readonly tourTypeService: TourTypeService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTourTypeDto: CreateTourTypeDto): Promise<ApiResponse<TourType>> {
    return this.tourTypeService.create(createTourTypeDto);
  }

  @Post('get-all')
  findAll(@Body() filterDto: FilterTourCategoriesDto): Promise<ApiResponse<TourType[]>> {
    return this.tourTypeService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<TourType> {
    return this.tourTypeService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTourTypeDto: UpdateTourTypeDto,
  ): Promise<ApiResponse<TourType>> {
    return this.tourTypeService.update(id, updateTourTypeDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.tourTypeService.remove(id);
  }
} 