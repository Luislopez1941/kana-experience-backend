import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { YachtService } from './yacht.service';
import { CreateYachtDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { ApiResponse } from './types/api-response.type';
import { Yacht } from './entities/yacht.entity';

@Controller('yachts')
export class YachtController {
  constructor(private readonly yachtService: YachtService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createYachtDto: CreateYachtDto): Promise<ApiResponse<Yacht>> {
    return this.yachtService.create(createYachtDto);
  }

  @Get('get-all')
  findAll(): Promise<ApiResponse<Yacht[]>> {
    return this.yachtService.findAll();
  }

  @Post('by-category')
  getYachtsByYachtCategory(
    @Body('yachtCategoryId') yachtCategoryId: number,
    @Body('page') page: number,
  ): Promise<ApiResponse<Yacht[]>> {
    return this.yachtService.getYachtsByYachtCategory(yachtCategoryId, page);
  }

  @Get('get-yacht-by-id/:id')
  findOne(@Param('id') id: string) {
    return this.yachtService.findOne(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateYachtDto: UpdateYachtDto): Promise<ApiResponse<Yacht>> {
    return this.yachtService.update(+id, updateYachtDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.yachtService.remove(+id);
  }
}
