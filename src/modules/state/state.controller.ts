import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { StateService } from './state.service';
import { ApiResponse } from './types/api-response.type';
import { State } from './entities/state.entity';

@Controller('states')
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Get('get-all')
  findAll(): Promise<ApiResponse<State[]>> {
    return this.stateService.findAll();
  }

  @Get('by-name/:name')
  findByName(@Param('name') name: string): Promise<ApiResponse<State>> {
    return this.stateService.findByName(name);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<State> {
    return this.stateService.findOne(id);
  }
} 