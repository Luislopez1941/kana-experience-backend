import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateYachtTypeDto } from './dto/create-yacht-type.dto';
import { UpdateYachtTypeDto } from './dto/update-yacht-type.dto';
import { YachtType } from './entities/yacht-type.entity';
import { ApiResponse } from './types/api-response.type';

@Injectable()
export class YachtTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createYachtTypeDto: CreateYachtTypeDto): Promise<ApiResponse<YachtType>> {
    // Check if yacht type with name already exists
    const existingYachtType = await this.prisma.yachtType.findUnique({
      where: { name: createYachtTypeDto.name },
    });

    if (existingYachtType) {
      throw new ConflictException('Yacht type with this name already exists');
    }

    const yachtType = await this.prisma.yachtType.create({
      data: createYachtTypeDto,
    });

    return {data: yachtType, status: 'success',  message: 'Tipo de embarcación creado correctamente'};
  }

  async findAll(): Promise<ApiResponse<YachtType[]>> {
    const yachtTypes = await this.prisma.yachtType.findMany({
      orderBy: { name: 'asc' },
    });

    return {data: yachtTypes, status: 'success', message: 'Tipos de embarcación obtenidos correctamente'};
  }

  async findOne(id: number): Promise<YachtType> {
    const yachtType = await this.prisma.yachtType.findUnique({
      where: { id },
    });

    if (!yachtType) {
      throw new NotFoundException(`Yacht type with ID ${id} not found`);
    }

    return yachtType;
  }

  async update(id: number, updateYachtTypeDto: UpdateYachtTypeDto): Promise<ApiResponse<YachtType>> {
    // Check if yacht type exists
    const existingYachtType = await this.prisma.yachtType.findUnique({
      where: { id },
    });

    if (!existingYachtType) {
      throw new NotFoundException(`Yacht type with ID ${id} not found`);
    }

    // If name is being updated, check if it's already taken
    if (updateYachtTypeDto.name && updateYachtTypeDto.name !== existingYachtType.name) {
      const yachtTypeWithName = await this.prisma.yachtType.findUnique({
        where: { name: updateYachtTypeDto.name },
      });

      if (yachtTypeWithName) {
        throw new ConflictException('Yacht type with this name already exists');
      }
    }

    const updatedYachtType = await this.prisma.yachtType.update({
      where: { id },
      data: updateYachtTypeDto,
    });

    return {data: updatedYachtType, status: 'success', message: 'Tipo de embarcación actualizado correctamente'};
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if yacht type exists
    const existingYachtType = await this.prisma.yachtType.findUnique({
      where: { id },
    });

    if (!existingYachtType) {
      throw new NotFoundException(`Yacht type with ID ${id} not found`);
    }

    // Check if there are yachts using this type
    const yachtsWithType = await this.prisma.yacht.findMany({
      where: { yachtTypeId: id },
    });

    if (yachtsWithType.length > 0) {
      throw new ConflictException('Cannot delete yacht type that is being used by yachts');
    }

    await this.prisma.yachtType.delete({
      where: { id },
    });

    return {data: { deleted: true }, status: 'success', message: 'Tipo de embarcación eliminado correctamente'};
  }
} 