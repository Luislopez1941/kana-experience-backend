import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocalityDto } from './dto/create-locality.dto';
import { UpdateLocalityDto } from './dto/update-locality.dto';
import { Locality } from './entities/locality.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class LocalitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLocalityDto: CreateLocalityDto): Promise<ApiResponse<Locality>> {
    const locality = await this.prisma.locality.create({
      data: createLocalityDto,
      include: {
        municipality: {
          include: {
            state: true,
          },
        },
      },
    });

    return {
      data: locality,
      status: 'success',
      message: 'Localidad creada correctamente'
    };
  }

  async findAll(): Promise<ApiResponse<Locality[]>> {
    const localities = await this.prisma.locality.findMany({
      include: {
        municipality: {
          include: {
            state: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: localities,
      status: 'success',
      message: 'Localidades obtenidas correctamente'
    };
  }

  async findOne(id: number): Promise<Locality> {
    const locality = await this.prisma.locality.findUnique({
      where: { id },
      include: {
        municipality: {
          include: {
            state: true,
          },
        },
      },
    });

    if (!locality) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }

    return locality;
  }

  async getByMunicipality(municipalityId: number): Promise<ApiResponse<Locality[]>> {
    // Check if municipality exists
    const municipality = await this.prisma.municipality.findUnique({
      where: { id: municipalityId },
    });

    if (!municipality) {
      throw new NotFoundException(`Municipio con ID ${municipalityId} no encontrado`);
    }

    const localities = await this.prisma.locality.findMany({
      where: { municipalityId },
      include: {
        municipality: {
          include: {
            state: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: localities,
      status: 'success',
      message: `Localidades de ${municipality.name} obtenidas correctamente`
    };
  }

  async update(id: number, updateLocalityDto: UpdateLocalityDto): Promise<ApiResponse<Locality>> {
    // Check if locality exists
    const existingLocality = await this.prisma.locality.findUnique({
      where: { id },
    });

    if (!existingLocality) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }

    const locality = await this.prisma.locality.update({
      where: { id },
      data: updateLocalityDto,
      include: {
        municipality: {
          include: {
            state: true,
          },
        },
      },
    });

    return {
      data: locality,
      status: 'success',
      message: 'Localidad actualizada correctamente'
    };
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if locality exists
    const existingLocality = await this.prisma.locality.findUnique({
      where: { id },
    });

    if (!existingLocality) {
      throw new NotFoundException(`Localidad con ID ${id} no encontrada`);
    }

    await this.prisma.locality.delete({
      where: { id },
    });

    return {
      data: { deleted: true },
      status: 'success',
      message: 'Localidad eliminada correctamente'
    };
  }
}
