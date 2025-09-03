import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateTourTypeDto } from './dto/create-tour-type.dto';
import { UpdateTourTypeDto } from './dto/update-tour-type.dto';
import { TourType } from './entities/tour-type.entity';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar categorías de tours
export interface FilterTourCategoriesDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
}

@Injectable()
export class TourTypeService {
  private readonly storageBucket = 'tour-categories'; // Bucket de Supabase Storage

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  private async saveBase64Image(base64Data: string, filename: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const uniqueFilename = this.supabase.generateUniqueFileName(filename, 'tour_category_');
      
      // Upload a Supabase Storage
      const imageUrl = await this.supabase.uploadBase64Image(
        this.storageBucket,
        uniqueFilename,
        base64Data
      );
      
      return imageUrl;
    } catch (error) {
      throw new Error(`Error processing image: ${error.message}`);
    }
  }

  private async deleteImage(imagePath: string): Promise<void> {
    try {
      // Extraer solo el nombre del archivo de la URL completa
      const filename = imagePath.split('/').pop();
      if (filename) {
        await this.supabase.deleteImage(this.storageBucket, filename);
      }
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
    }
  }

  async create(createTourTypeDto: CreateTourTypeDto): Promise<ApiResponse<TourType>> {
    // Check if tour category with name already exists
    const existingTourCategory = await this.prisma.tourCategory.findUnique({
      where: { name: createTourTypeDto.name },
    });

    if (existingTourCategory) {
      throw new ConflictException('Tour category with this name already exists');
    }

    // Prepare data without image
    const { image, ...tourCategoryData } = createTourTypeDto;

    // Process image if provided
    let imageUrl: string | null = null;
    if (image && image.startsWith('data:image')) {
      const filename = `${createTourTypeDto.name.replace(/\s+/g, '_').toLowerCase()}.jpg`;
      imageUrl = await this.saveBase64Image(image, filename);
    }

    const tourCategory = await this.prisma.tourCategory.create({
      data: {
        ...tourCategoryData,
        image: imageUrl,
      },
    });

    return {data: tourCategory, status: 'success',  message: 'Categoría de tour creada correctamente'};
  }

  async findAll(): Promise<ApiResponse<TourType[]>> {
    const tourCategories = await this.prisma.tourCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: tourCategories, 
      status: 'success', 
      message: 'Todas las categorías de tour obtenidas correctamente'
    };
  }

  async findAllWithFilters(filterDto?: FilterTourCategoriesDto): Promise<ApiResponse<TourType[]>> {
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

    const tourCategories = await this.prisma.tourCategory.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return {
      data: tourCategories, 
      status: 'success', 
      message: 'Categorías de tour filtradas obtenidas correctamente'
    };
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

    // Prepare update data
    const { image, ...updateData } = updateTourTypeDto;

    // Process image if provided
    let imageUrl: string | null = existingTourCategory.image;
    if (image) {
      if (image.startsWith('data:image')) {
        // New base64 image - delete old one and upload new one
        if (existingTourCategory.image) {
          await this.deleteImage(existingTourCategory.image);
        }
        const filename = `${updateTourTypeDto.name || existingTourCategory.name.replace(/\s+/g, '_').toLowerCase()}.jpg`;
        imageUrl = await this.saveBase64Image(image, filename);
      } else {
        // URL provided - use as is
        imageUrl = image;
      }
    }

    const updatedTourCategory = await this.prisma.tourCategory.update({
      where: { id },
      data: {
        ...updateData,
        image: imageUrl,
      },
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

    // Delete image if exists
    if (existingTourCategory.image) {
      await this.deleteImage(existingTourCategory.image);
    }

    await this.prisma.tourCategory.delete({
      where: { id },
    });

    return {data: { deleted: true }, status: 'success', message: 'Categoría de tour eliminada correctamente'};
  }
} 