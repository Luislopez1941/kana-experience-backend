import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { ApiResponse } from './types/api-response.type';
import { Municipality } from './entities/municipality.entity';

@Controller('municipalities')
export class MunicipalityController {
  constructor(private readonly municipalityService: MunicipalityService) {}

  @Get('get-all')
  findAll(): Promise<ApiResponse<Municipality[]>> {
    return this.municipalityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Municipality> {
    return this.municipalityService.findOne(id);
  }

  @Get('by-state/:stateId')
  getByState(@Param('stateId', ParseIntPipe) stateId: number): Promise<ApiResponse<Municipality[]>> {
    return this.municipalityService.getByState(stateId);
  }
} 