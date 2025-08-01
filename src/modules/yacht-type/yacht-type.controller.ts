import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { YachtTypeService } from './yacht-type.service';
import { YachtService } from '../yacht/yacht.service';
import { CreateYachtTypeDto } from './dto/create-yacht-type.dto';
import { UpdateYachtTypeDto } from './dto/update-yacht-type.dto';
import { ApiResponse } from './types/api-response.type';
import { YachtType } from './entities/yacht-type.entity';
import { Yacht } from '../yacht/entities/yacht.entity';

@Controller('yacht-types')
export class YachtTypeController {
  constructor(
    private readonly yachtTypeService: YachtTypeService,
    private readonly yachtService: YachtService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createYachtTypeDto: CreateYachtTypeDto): Promise<ApiResponse<YachtType>> {
    return this.yachtTypeService.create(createYachtTypeDto);
  }

  @Get('get-all')
  findAll(): Promise<ApiResponse<YachtType[]>> {
    return this.yachtTypeService.findAll();
  }

  @Get(':id/yachts')
  getYachtsByType(@Param('id') id: string): Promise<ApiResponse<Yacht[]>> {
    return this.yachtService.getYachtsByYachtType(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.yachtTypeService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateYachtTypeDto: UpdateYachtTypeDto): Promise<ApiResponse<YachtType>> {
    return this.yachtTypeService.update(+id, updateYachtTypeDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.yachtTypeService.remove(+id);
  }
} 