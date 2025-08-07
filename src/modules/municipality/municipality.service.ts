import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Municipality } from './entities/municipality.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class MunicipalityService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<Municipality[]>> {
    const municipalities = await this.prisma.municipality.findMany({
      include: {
        state: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: municipalities,
      status: 'success',
      message: 'Municipios obtenidos correctamente'
    };
  }

  async findOne(id: number): Promise<Municipality> {
    const municipality = await this.prisma.municipality.findUnique({
      where: { id },
      include: {
        state: true,
        localities: true,
      },
    });

    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${id} not found`);
    }

    return municipality;
  }

  async getByState(stateId: number): Promise<ApiResponse<Municipality[]>> {
    // Check if state exists
    const state = await this.prisma.state.findUnique({
      where: { id: stateId },
    });

    if (!state) {
      throw new NotFoundException(`State with ID ${stateId} not found`);
    }

    const municipalities = await this.prisma.municipality.findMany({
      where: { stateId },
      include: {
        state: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: municipalities,
      status: 'success',
      message: `Municipios de ${state.name} obtenidos correctamente`
    };
  }

  async findByName(name: string): Promise<ApiResponse<Municipality>> {
    const municipality = await this.prisma.municipality.findFirst({
      where: { 
        name: {
          contains: name,
        },
      },
      include: {
        state: true,
        localities: true,
      },
    });

    if (!municipality) {
      throw new NotFoundException(`Municipality with name "${name}" not found`);
    }

    return {
      data: municipality,
      status: 'success',
      message: `Municipio "${municipality.name}" obtenido correctamente`
    };
  }
} 