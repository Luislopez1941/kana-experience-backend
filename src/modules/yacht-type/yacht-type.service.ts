import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateYachtTypeDto } from './dto/create-yacht-type.dto';
import { UpdateYachtTypeDto } from './dto/update-yacht-type.dto';
import { YachtCategory } from './entities/yacht-type.entity';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar categorías de yates
export interface FilterYachtCategoriesDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
}

@Injectable()
export class YachtTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createYachtTypeDto: CreateYachtTypeDto): Promise<ApiResponse<YachtCategory>> {
    // Validar permisos del usuario - solo SUPER_ADMIN puede crear tipos de yates
    const user = await this.prisma.user.findUnique({
      where: { id: createYachtTypeDto.userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createYachtTypeDto.userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido crear tipos de yates. Solo los usuarios SUPER_ADMIN pueden crear tipos de yates.');
    }

    // Check if yacht category with name already exists
    const existingYachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { name: createYachtTypeDto.name },
    });

    if (existingYachtCategory) {
      throw new ConflictException('Yacht category with this name already exists');
    }

    // Solo usar los campos del DTO, ignorar campos extra como typeUser
    const yachtCategoryData = {
      name: createYachtTypeDto.name,
      userId: createYachtTypeDto.userId,
      stateId: createYachtTypeDto.stateId,
      municipalityId: createYachtTypeDto.municipalityId,
      localityId: createYachtTypeDto.localityId,
    };

    const yachtCategory = await this.prisma.yachtCategory.create({
      data: yachtCategoryData,
    });

    return {data: yachtCategory, status: 'success',  message: 'Categoría de embarcación creada correctamente'};
  }

  async findAll(filterDto?: FilterYachtCategoriesDto): Promise<ApiResponse<YachtCategory[]>> {
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

    const yachtCategories = await this.prisma.yachtCategory.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return {data: yachtCategories, status: 'success', message: 'Categorías de embarcación obtenidas correctamente'};
  }

  async findOne(id: number): Promise<YachtCategory> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`ID inválido: ${id}`);
    }

    const yachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id },
    });

    if (!yachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${id} not found`);
    }

    return yachtCategory;
  }

  async update(id: number, updateYachtTypeDto: UpdateYachtTypeDto): Promise<ApiResponse<YachtCategory>> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`ID inválido: ${id}`);
    }

    // Validar permisos del usuario - solo SUPER_ADMIN puede actualizar tipos de yates
    const user = await this.prisma.user.findUnique({
      where: { id: updateYachtTypeDto.userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${updateYachtTypeDto.userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido actualizar tipos de yates. Solo los usuarios SUPER_ADMIN pueden actualizar tipos de yates.');
    }

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

    // Solo usar los campos del DTO, ignorar campos extra como typeUser
    const updateData: any = {};
    if (updateYachtTypeDto.name) updateData.name = updateYachtTypeDto.name;
    if (updateYachtTypeDto.userId) updateData.userId = updateYachtTypeDto.userId;
    if (updateYachtTypeDto.stateId) updateData.stateId = updateYachtTypeDto.stateId;
    if (updateYachtTypeDto.municipalityId) updateData.municipalityId = updateYachtTypeDto.municipalityId;
    if (updateYachtTypeDto.localityId) updateData.localityId = updateYachtTypeDto.localityId;

    const updatedYachtCategory = await this.prisma.yachtCategory.update({
      where: { id },
      data: updateData,
    });

    return {data: updatedYachtCategory, status: 'success', message: 'Categoría de embarcación actualizada correctamente'};
  }

  async remove(id: number, userId: number): Promise<ApiResponse<{ deleted: boolean }>> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`ID inválido: ${id}`);
    }

    if (!userId || isNaN(userId)) {
      throw new NotFoundException(`User ID inválido: ${userId}`);
    }

    // Validar permisos del usuario - solo SUPER_ADMIN puede eliminar tipos de yates
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido eliminar tipos de yates. Solo los usuarios SUPER_ADMIN pueden eliminar tipos de yates.');
    }

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