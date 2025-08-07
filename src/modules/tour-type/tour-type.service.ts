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
    // Check if tour category with name already exists
    const existingTourCategory = await this.prisma.tourCategory.findUnique({
      where: { name: createTourTypeDto.name },
    });

    if (existingTourCategory) {
      throw new ConflictException('Tour category with this name already exists');
    }

    const tourCategory = await this.prisma.tourCategory.create({
      data: createTourTypeDto,
    });

    return {data: tourCategory, status: 'success',  message: 'Categoría de tour creada correctamente'};
  }

  async findAll(): Promise<ApiResponse<TourType[]>> {
    const tourCategories = await this.prisma.tourCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return {data: tourCategories, status: 'success', message: 'Categorías de tour obtenidas correctamente'};
  }

  async findOne(id: number): Promise<TourType> {
    const tourCategory = await this.prisma.tourCategory.findUnique({
      where: { id },
    });

    if (!tourCategory) {
      throw new NotFoundException(`Tour category with ID ${id} not found`);
    }

    return tourCategory;
  }

  async update(id: number, updateTourTypeDto: UpdateTourTypeDto): Promise<ApiResponse<TourType>> {
    // Check if tour category exists
    const existingTourCategory = await this.prisma.tourCategory.findUnique({
      where: { id },
    });

    if (!existingTourCategory) {
      throw new NotFoundException(`Tour category with ID ${id} not found`);
    }

    // If name is being updated, check if it's already taken
    if (updateTourTypeDto.name && updateTourTypeDto.name !== existingTourCategory.name) {
      const tourCategoryWithName = await this.prisma.tourCategory.findUnique({
        where: { name: updateTourTypeDto.name },
      });

      if (tourCategoryWithName) {
        throw new ConflictException('Tour category with this name already exists');
      }
    }

    const updatedTourCategory = await this.prisma.tourCategory.update({
      where: { id },
      data: updateTourTypeDto,
    });

    return {data: updatedTourCategory, status: 'success', message: 'Categoría de tour actualizada correctamente'};
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if tour category exists
    const existingTourCategory = await this.prisma.tourCategory.findUnique({
      where: { id },
    });

    if (!existingTourCategory) {
      throw new NotFoundException(`Tour category with ID ${id} not found`);
    }

    // Check if there are tours using this category
    const toursWithCategory = await this.prisma.tour.findMany({
      where: { tourCategoryId: id },
    });

    if (toursWithCategory.length > 0) {
      throw new ConflictException('Cannot delete tour category that is being used by tours');
    }

    await this.prisma.tourCategory.delete({
      where: { id },
    });

    return {data: { deleted: true }, status: 'success', message: 'Categoría de tour eliminada correctamente'};
  }
} 