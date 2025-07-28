import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class ClubService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClubDto: CreateClubDto): Promise<ApiResponse<Club>> {
    // Check if club type exists
    const clubType = await this.prisma.clubType.findUnique({
      where: { id: createClubDto.typeId },
    });

    if (!clubType) {
      throw new NotFoundException(`Club type with ID ${createClubDto.typeId} not found`);
    }

    // Check if state exists
    const state = await this.prisma.state.findUnique({
      where: { id: createClubDto.stateId },
    });

    if (!state) {
      throw new NotFoundException(`State with ID ${createClubDto.stateId} not found`);
    }

    // Check if municipality exists and belongs to the state
    const municipality = await this.prisma.municipality.findFirst({
      where: {
        id: createClubDto.municipalityId,
        stateId: createClubDto.stateId,
      },
    });

    if (!municipality) {
      throw new NotFoundException(`Municipality with ID ${createClubDto.municipalityId} not found in state ${createClubDto.stateId}`);
    }

    // Check if locality exists and belongs to the municipality
    const locality = await this.prisma.locality.findFirst({
      where: {
        id: createClubDto.localityId,
        municipalityId: createClubDto.municipalityId,
      },
    });

    if (!locality) {
      throw new NotFoundException(`Locality with ID ${createClubDto.localityId} not found in municipality ${createClubDto.municipalityId}`);
    }

    const club = await this.prisma.club.create({
      data: createClubDto,
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
      },
    });

    return {
      data: club,
      status: 'success',
      message: 'Club creado correctamente'
    };
  }

  async findAll(): Promise<ApiResponse<Club[]>> {
    const clubs = await this.prisma.club.findMany({
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: clubs,
      status: 'success',
      message: 'Clubs obtenidos correctamente'
    };
  }

  async findOne(id: number): Promise<Club> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
      },
    });

    if (!club) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    return club;
  }

  async update(id: number, updateClubDto: UpdateClubDto): Promise<ApiResponse<Club>> {
    // Check if club exists
    const existingClub = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!existingClub) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Validate club type if being updated
    if (updateClubDto.typeId) {
      const clubType = await this.prisma.clubType.findUnique({
        where: { id: updateClubDto.typeId },
      });

      if (!clubType) {
        throw new NotFoundException(`Club type with ID ${updateClubDto.typeId} not found`);
      }
    }

    // Validate state if being updated
    if (updateClubDto.stateId) {
      const state = await this.prisma.state.findUnique({
        where: { id: updateClubDto.stateId },
      });

      if (!state) {
        throw new NotFoundException(`State with ID ${updateClubDto.stateId} not found`);
      }
    }

    // Validate municipality if being updated
    if (updateClubDto.municipalityId) {
      const stateId = updateClubDto.stateId || existingClub.stateId;
      const municipality = await this.prisma.municipality.findFirst({
        where: {
          id: updateClubDto.municipalityId,
          stateId: stateId,
        },
      });

      if (!municipality) {
        throw new NotFoundException(`Municipality with ID ${updateClubDto.municipalityId} not found in state ${stateId}`);
      }
    }

    // Validate locality if being updated
    if (updateClubDto.localityId) {
      const municipalityId = updateClubDto.municipalityId || existingClub.municipalityId;
      const locality = await this.prisma.locality.findFirst({
        where: {
          id: updateClubDto.localityId,
          municipalityId: municipalityId,
        },
      });

      if (!locality) {
        throw new NotFoundException(`Locality with ID ${updateClubDto.localityId} not found in municipality ${municipalityId}`);
      }
    }

    const updatedClub = await this.prisma.club.update({
      where: { id },
      data: updateClubDto,
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
      },
    });

    return {
      data: updatedClub,
      status: 'success',
      message: 'Club actualizado correctamente'
    };
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if club exists
    const existingClub = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!existingClub) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    await this.prisma.club.delete({
      where: { id },
    });

    return {
      data: { deleted: true },
      status: 'success',
      message: 'Club eliminado correctamente'
    };
  }

  async getByType(typeId: number): Promise<ApiResponse<Club[]>> {
    // Check if club type exists
    const clubType = await this.prisma.clubType.findUnique({
      where: { id: typeId },
    });

    if (!clubType) {
      throw new NotFoundException(`Club type with ID ${typeId} not found`);
    }

    const clubs = await this.prisma.club.findMany({
      where: { typeId },
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: clubs,
      status: 'success',
      message: `Clubs de tipo ${clubType.name} obtenidos correctamente`
    };
  }
} 