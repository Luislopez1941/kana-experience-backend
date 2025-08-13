import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClubService, FilterClubsDto } from './club.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { Club } from './entities/club.entity';
import { ApiResponse } from './types/api-response.type';

@Controller('clubs')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClubDto: CreateClubDto): Promise<ApiResponse<Club>> {
    return this.clubService.create(createClubDto);
  }

  @Post('get-by-ids')
  findAll(@Body() filterDto: FilterClubsDto): Promise<ApiResponse<Club[]>> {
    return this.clubService.findAll(filterDto);
  }

  @Get('by-category/:typeId')
  getByType(@Param('typeId', ParseIntPipe) typeId: number): Promise<ApiResponse<Club[]>> {
    return this.clubService.getByType(typeId);
  }

  @Get('get-by-id/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Club> {
    return this.clubService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClubDto: UpdateClubDto): Promise<ApiResponse<Club>> {
    return this.clubService.update(id, updateClubDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.clubService.remove(id);
  }
} 