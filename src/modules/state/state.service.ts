import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { State } from './entities/state.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class StateService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<State[]>> {
    const states = await this.prisma.state.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: states,
      status: 'success',
      message: 'Estados obtenidos correctamente'
    };
  }

  async findOne(id: number): Promise<State> {
    const state = await this.prisma.state.findUnique({
      where: { id },
      include: {
        municipalities: true,
      },
    });

    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return state;
  }

  async findByName(name: string): Promise<ApiResponse<State>> {
    const state = await this.prisma.state.findFirst({
      where: { 
        name: {
          contains: name,
        },
      },
      include: {
        municipalities: {
          include: {
            localities: true,
          },
        },
      },
    });

    if (!state) {
      throw new NotFoundException(`State with name "${name}" not found`);
    }

    return {
      data: state,
      status: 'success',
      message: `Estado "${state.name}" obtenido correctamente`
    };
  }
} 