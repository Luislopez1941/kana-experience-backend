import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { LocalitiesService, FilterLocalitiesDto } from './localities.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { ApiResponse } from './types/api-response.type';
import { Locality } from './entities/locality.entity';

@Controller('localities')
export class LocalitiesController {
  constructor(private readonly localitiesService: LocalitiesService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLocalityDto: CreateLocalityDto): Promise<ApiResponse<Locality>> {
    return this.localitiesService.create(createLocalityDto);
  }

  @Post('get-by-ids')
  findAll(@Body() filterDto: FilterLocalitiesDto): Promise<ApiResponse<Locality[]>> {
    return this.localitiesService.findAll(filterDto);
  }

  @Get('by-municipality/:municipalityId')
  getByMunicipality(@Param('municipalityId', ParseIntPipe) municipalityId: number): Promise<ApiResponse<Locality[]>> {
    return this.localitiesService.getByMunicipality(municipalityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Locality> {
    return this.localitiesService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLocalityDto: UpdateLocalityDto): Promise<ApiResponse<Locality>> {
    return this.localitiesService.update(id, updateLocalityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.localitiesService.remove(id);
  }
}
