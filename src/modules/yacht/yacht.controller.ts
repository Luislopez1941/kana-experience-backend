import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Request, UseGuards } from '@nestjs/common';
import { YachtService, FilterYachtsDto } from './yacht.service';
import { CreateYachtDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { ApiResponse } from './types/api-response.type';
import { Yacht } from './entities/yacht.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('yachts')
@UseGuards(JwtAuthGuard)
export class YachtController {
  constructor(private readonly yachtService: YachtService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createYachtDto: CreateYachtDto): Promise<ApiResponse<Yacht>> {
    return this.yachtService.create(createYachtDto);
  }

  @Post('get-yacht-by-ids')
  findAll(@Body() filterDto: FilterYachtsDto): Promise<ApiResponse<Yacht[]>> {
    return this.yachtService.findAll(filterDto);
  }

  @Post('by-category')
  getYachtsByYachtCategory(
    @Body('yachtCategoryId') yachtCategoryId: number,
    @Body('page') page: number = 1,
  ): Promise<ApiResponse<Yacht[]>> {
    return this.yachtService.getYachtsByYachtCategory(yachtCategoryId, page);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateYachtDto: UpdateYachtDto): Promise<ApiResponse<Yacht>> {
    return this.yachtService.update(+id, updateYachtDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.yachtService.remove(+id, userId);
  }
}
