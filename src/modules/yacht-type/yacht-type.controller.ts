import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { YachtTypeService, FilterYachtCategoriesDto } from './yacht-type.service';
import { CreateYachtTypeDto } from './dto/create-yacht-type.dto';
import { UpdateYachtTypeDto } from './dto/update-yacht-type.dto';
import { ApiResponse } from './types/api-response.type';
import { YachtCategory } from './entities/yacht-type.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('yacht-categories')
export class YachtTypeController {
  constructor(private readonly yachtTypeService: YachtTypeService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createYachtTypeDto: CreateYachtTypeDto, @Request() req): Promise<ApiResponse<YachtCategory>> {
    return this.yachtTypeService.create(createYachtTypeDto);
  }

  
  @Post('get-categories-by-ids')
  @UseGuards(JwtAuthGuard)
  getCategoriesByFilter(@Body() filterDto: FilterYachtCategoriesDto): Promise<ApiResponse<YachtCategory[]>> {
    return this.yachtTypeService.findAll(filterDto);
  }

  @Post('get-categories')
  findAll(@Body('userId') userId: number): Promise<ApiResponse<YachtCategory[]>> {
    return this.yachtTypeService.findAll({ userId });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string): Promise<YachtCategory> {
    return this.yachtTypeService.findOne(+id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateYachtTypeDto: UpdateYachtTypeDto): Promise<ApiResponse<YachtCategory>> {
    return this.yachtTypeService.update(+id, updateYachtTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.yachtTypeService.remove(+id, userId);
  }
} 