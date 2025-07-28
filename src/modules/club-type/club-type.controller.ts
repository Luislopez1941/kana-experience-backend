import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClubTypeService } from './club-type.service';
import { CreateClubTypeDto } from './dto/create-club-type.dto';
import { UpdateClubTypeDto } from './dto/update-club-type.dto';
import { ClubType } from './entities/club-type.entity';
import { ApiResponse } from './types/api-response.type';

@Controller('club-types')
export class ClubTypeController {
  constructor(private readonly clubTypeService: ClubTypeService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClubTypeDto: CreateClubTypeDto): Promise<ApiResponse<ClubType>> {
    return this.clubTypeService.create(createClubTypeDto);
  }

  @Get('get-all')
  findAll(): Promise<ApiResponse<ClubType[]>> {
    return this.clubTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ClubType> {
    return this.clubTypeService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClubTypeDto: UpdateClubTypeDto): Promise<ApiResponse<ClubType>> {
    return this.clubTypeService.update(id, updateClubTypeDto);
  }

  @Delete('delete/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.clubTypeService.remove(id);
  }
} 