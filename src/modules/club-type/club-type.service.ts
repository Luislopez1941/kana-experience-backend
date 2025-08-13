import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ClubType } from './entities/club-type.entity';
import { CreateClubTypeDto } from './dto/create-club-type.dto';
import { UpdateClubTypeDto } from './dto/update-club-type.dto';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar tipos de clubs
export interface FilterClubTypesDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
}

@Injectable()
export class ClubTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClubTypeDto: CreateClubTypeDto): Promise<ApiResponse<ClubType>> {
    // Check if club type with same name already exists
    const existingClubType = await this.prisma.clubType.findUnique({
      where: { name: createClubTypeDto.name },
    });

    if (existingClubType) {
      throw new ConflictException('Club type with this name already exists');
    }

    const clubType = await this.prisma.clubType.create({
      data: createClubTypeDto,
    });

    return {
      data: clubType,
      status: 'success',
      message: 'Tipo de club creado correctamente'
    };
  }

  async findAll(filterDto?: FilterClubTypesDto): Promise<ApiResponse<ClubType[]>> {
    let whereClause: any = {};

    // Aplicar filtros si se proporcionan
    if (filterDto) {
      if (filterDto.stateId) {
        whereClause.stateId = filterDto.stateId;
      }
      if (filterDto.municipalityId) {
        whereClause.municipalityId = filterDto.municipalityId;
      }
      if (filterDto.localityId) {
        whereClause.localityId = filterDto.localityId;
      }
      if (filterDto.userId) {
        whereClause.userId = filterDto.userId;
      }
    }

    const clubTypes = await this.prisma.clubType.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return {
      data: clubTypes,
      status: 'success',
      message: 'Tipos de club obtenidos correctamente'
    };
  }

  async findOne(id: number): Promise<ClubType> {
    const clubType = await this.prisma.clubType.findUnique({
      where: { id },
    });

    if (!clubType) {
      throw new NotFoundException(`Club type with ID ${id} not found`);
    }

    return clubType;
  }

  async update(id: number, updateClubTypeDto: UpdateClubTypeDto): Promise<ApiResponse<ClubType>> {
    // Check if club type exists
    const existingClubType = await this.prisma.clubType.findUnique({
      where: { id },
    });

    if (!existingClubType) {
      throw new NotFoundException(`Club type with ID ${id} not found`);
    }

    // Check if name is being updated and if it conflicts with existing name
    if (updateClubTypeDto.name && updateClubTypeDto.name !== existingClubType.name) {
      const conflictingClubType = await this.prisma.clubType.findUnique({
        where: { name: updateClubTypeDto.name },
      });

      if (conflictingClubType) {
        throw new ConflictException('Club type with this name already exists');
      }
    }

    const updatedClubType = await this.prisma.clubType.update({
      where: { id },
      data: updateClubTypeDto,
    });

    return {
      data: updatedClubType,
      status: 'success',
      message: 'Tipo de club actualizado correctamente'
    };
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if club type exists
    const existingClubType = await this.prisma.clubType.findUnique({
      where: { id },
    });

    if (!existingClubType) {
      throw new NotFoundException(`Club type with ID ${id} not found`);
    }

    // Check if club type is being used by any clubs
    const clubsWithType = await this.prisma.club.findMany({
      where: { typeId: id },
    });

    if (clubsWithType.length > 0) {
      throw new ConflictException('Cannot delete club type that is being used by clubs');
    }

    await this.prisma.clubType.delete({
      where: { id },
    });

    return {
      data: { deleted: true },
      status: 'success',
      message: 'Tipo de club eliminado correctamente'
    };
  }
} 