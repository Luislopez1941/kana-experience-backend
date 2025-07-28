import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTourTypeDto } from './dto/create-tour-type.dto';
import { UpdateTourTypeDto } from './dto/update-tour-type.dto';
import { TourType } from './entities/tour-type.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class TourTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTourTypeDto: CreateTourTypeDto): Promise<ApiResponse<TourType>> {
    // Check if tour type with name already exists
    const existingTourType = await this.prisma.tourType.findUnique({
      where: { name: createTourTypeDto.name },
    });

    if (existingTourType) {
      throw new ConflictException('Tour type with this name already exists');
    }

    const tourType = await this.prisma.tourType.create({
      data: createTourTypeDto,
    });

    return {data: tourType, status: 'success',  message: 'Tipo de tour creado correctamente'};
  }

  async findAll(): Promise<ApiResponse<TourType[]>> {
    const tourTypes = await this.prisma.tourType.findMany({
      orderBy: { name: 'asc' },
    });

    return {data: tourTypes, status: 'success', message: 'Tipos de tour obtenidos correctamente'};
  }

  async findOne(id: number): Promise<TourType> {
    const tourType = await this.prisma.tourType.findUnique({
      where: { id },
    });

    if (!tourType) {
      throw new NotFoundException(`Tour type with ID ${id} not found`);
    }

    return tourType;
  }

  async update(id: number, updateTourTypeDto: UpdateTourTypeDto): Promise<ApiResponse<TourType>> {
    // Check if tour type exists
    const existingTourType = await this.prisma.tourType.findUnique({
      where: { id },
    });

    if (!existingTourType) {
      throw new NotFoundException(`Tour type with ID ${id} not found`);
    }

    // If name is being updated, check if it's already taken
    if (updateTourTypeDto.name && updateTourTypeDto.name !== existingTourType.name) {
      const tourTypeWithName = await this.prisma.tourType.findUnique({
        where: { name: updateTourTypeDto.name },
      });

      if (tourTypeWithName) {
        throw new ConflictException('Tour type with this name already exists');
      }
    }

    const updatedTourType = await this.prisma.tourType.update({
      where: { id },
      data: updateTourTypeDto,
    });

    return {data: updatedTourType, status: 'success', message: 'Tipo de tour actualizado correctamente'};
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if tour type exists
    const existingTourType = await this.prisma.tourType.findUnique({
      where: { id },
    });

    if (!existingTourType) {
      throw new NotFoundException(`Tour type with ID ${id} not found`);
    }

    // Check if there are tours using this type
    const toursWithType = await this.prisma.tour.findMany({
      where: { tourTypeId: id },
    });

    if (toursWithType.length > 0) {
      throw new ConflictException('Cannot delete tour type that is being used by tours');
    }

    await this.prisma.tourType.delete({
      where: { id },
    });

    return {data: { deleted: true }, status: 'success', message: 'Tipo de tour eliminado correctamente'};
  }
} 