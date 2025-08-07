import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateYachtTypeDto } from './dto/create-yacht-type.dto';
import { UpdateYachtTypeDto } from './dto/update-yacht-type.dto';
import { YachtCategory } from './entities/yacht-type.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class YachtTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createYachtTypeDto: CreateYachtTypeDto): Promise<ApiResponse<YachtCategory>> {
    // Check if yacht category with name already exists
    const existingYachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { name: createYachtTypeDto.name },
    });

    if (existingYachtCategory) {
      throw new ConflictException('Yacht category with this name already exists');
    }

    const yachtCategory = await this.prisma.yachtCategory.create({
      data: createYachtTypeDto,
    });

    return {data: yachtCategory, status: 'success',  message: 'Categoría de embarcación creada correctamente'};
  }

  async findAll(): Promise<ApiResponse<YachtCategory[]>> {
    const yachtCategories = await this.prisma.yachtCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return {data: yachtCategories, status: 'success', message: 'Categorías de embarcación obtenidas correctamente'};
  }

  async findOne(id: number): Promise<YachtCategory> {
    const yachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id },
    });

    if (!yachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${id} not found`);
    }

    return yachtCategory;
  }

  async update(id: number, updateYachtTypeDto: UpdateYachtTypeDto): Promise<ApiResponse<YachtCategory>> {
    // Check if yacht category exists
    const existingYachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id },
    });

    if (!existingYachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${id} not found`);
    }

    // If name is being updated, check if it's already taken
    if (updateYachtTypeDto.name && updateYachtTypeDto.name !== existingYachtCategory.name) {
      const yachtCategoryWithName = await this.prisma.yachtCategory.findUnique({
        where: { name: updateYachtTypeDto.name },
      });

      if (yachtCategoryWithName) {
        throw new ConflictException('Yacht category with this name already exists');
      }
    }

    const updatedYachtCategory = await this.prisma.yachtCategory.update({
      where: { id },
      data: updateYachtTypeDto,
    });

    return {data: updatedYachtCategory, status: 'success', message: 'Categoría de embarcación actualizada correctamente'};
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if yacht category exists
    const existingYachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id },
    });

    if (!existingYachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${id} not found`);
    }

    // Check if there are yachts using this category
    const yachtsWithCategory = await this.prisma.yacht.findMany({
      where: { yachtCategoryId: id },
    });

    if (yachtsWithCategory.length > 0) {
      throw new ConflictException('Cannot delete yacht category that is being used by yachts');
    }

    await this.prisma.yachtCategory.delete({
      where: { id },
    });

    return {data: { deleted: true }, status: 'success', message: 'Categoría de embarcación eliminada correctamente'};
  }
} 