import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour } from './entities/tour.entity';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar tours
export interface FilterToursDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
}

@Injectable()
export class TourService {
  private readonly storageBucket = 'tours'; // Bucket de Supabase Storage

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  private async saveBase64Image(base64Data: string, filename: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const uniqueFilename = this.supabase.generateUniqueFileName(filename, 'tour_');
      
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

  async create(createTourDto: CreateTourDto): Promise<ApiResponse<Tour>> {
    // Prepare tour data
    const { images, characteristics, pricing, ...tourData } = createTourDto;

    // Convert pricing array to JSON if provided
    const tourDataWithPricing = {
      ...tourData,
      pricing: pricing ? pricing as any : null,
    };

    const tour = await this.prisma.tour.create({
      data: tourDataWithPricing,
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
    });

    // Save images if provided
    if (images && images.length > 0) {
      const imagePromises = images.map(async (base64, index) => {
        const filename = `${tourData.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
        const imageUrl = await this.saveBase64Image(base64, filename);
        
        return this.prisma.tourImage.create({
          data: {
            url: imageUrl,
            tourId: tour.id,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Save characteristics if provided
    if (characteristics && characteristics.length > 0) {
      const characteristicPromises = characteristics.map(async (characteristic) => {
        return this.prisma.tourCharacteristic.create({
          data: {
            name: characteristic,
            tourId: tour.id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }

    // Fetch tour with images and characteristics
    const tourWithData = await this.prisma.tour.findUnique({
      where: { id: tour.id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
    });

    return {
      data: tourWithData!,
      status: 'success',
      message: 'Tour creado correctamente'
    };
  }

  async findAll(filterDto?: FilterToursDto): Promise<ApiResponse<Tour[]>> {
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

    const tours = await this.prisma.tour.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: tours,
      status: 'success',
      message: 'Tours obtenidos correctamente'
    };
  }

  async findOne(id: number): Promise<Tour> {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<ApiResponse<Tour>> {
    // Prepare update data
    const { images, characteristics, delete_images, pricing, ...updateData } = updateTourDto;

    // Convert pricing array to JSON if provided
    const updateDataWithPricing = {
      ...updateData,
      pricing: pricing ? pricing as any : undefined,
    };

    // Check if tour exists
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!existingTour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // Process delete_images if provided
    if (delete_images && delete_images.length > 0) {
      // Get images to delete by ID
      const imagesToDelete = await this.prisma.tourImage.findMany({
        where: {
          id: { in: delete_images },
          tourId: id,
        },
      });

      if (imagesToDelete.length > 0) {
        // Delete image files
        const deleteImagePromises = imagesToDelete.map(image => 
          this.deleteImage(image.url)
        );
        await Promise.all(deleteImagePromises);

        // Delete image records from database
        await this.prisma.tourImage.deleteMany({
          where: {
            id: { in: delete_images },
            tourId: id,
          },
        });
      }
    }

    // Process new images if provided
    if (updateTourDto.images && updateTourDto.images.length > 0) {
      // Separate existing URLs from new base64 images
      const existingUrls = updateTourDto.images.filter(img => 
        typeof img === 'string' && !img.startsWith('data:image')
      );
      
      const newBase64Images = updateTourDto.images.filter(img => 
        typeof img === 'string' && img.startsWith('data:image')
      );
      
      // Delete existing images that are not in the new list
      if (existingTour.images.length > 0) {
        const existingImageUrls = existingTour.images.map(img => img.url);
        const urlsToKeep = existingUrls.filter(url => existingImageUrls.includes(url));
        const urlsToDelete = existingImageUrls.filter(url => !urlsToKeep.includes(url));
        
        if (urlsToDelete.length > 0) {
          // Delete image files
          const deleteImagePromises = urlsToDelete.map(url => 
            this.deleteImage(url)
          );
          await Promise.all(deleteImagePromises);

          // Delete image records from database
          await this.prisma.tourImage.deleteMany({
            where: { 
              tourId: id,
              url: { in: urlsToDelete }
            },
          });
        }
      }
      
      // Save new base64 images
      if (newBase64Images.length > 0) {
        const imagePromises = newBase64Images.map(async (base64, index) => {
          const filename = `${updateTourDto.name || existingTour.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
          const imageUrl = await this.saveBase64Image(base64, filename);
          
          return this.prisma.tourImage.create({
            data: {
              url: imageUrl,
              tourId: id,
            },
          });
        });

        await Promise.all(imagePromises);
      }
    }

    // Process new characteristics if provided
    if (updateTourDto.characteristics && updateTourDto.characteristics.length > 0) {
      // Delete existing characteristics
      await this.prisma.tourCharacteristic.deleteMany({
        where: { tourId: id },
      });
      
      // Save new characteristics
      const characteristicPromises = updateTourDto.characteristics.map(async (characteristic) => {
        return this.prisma.tourCharacteristic.create({
          data: {
            name: characteristic,
            tourId: id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }

    const updatedTour = await this.prisma.tour.update({
      where: { id },
      data: updateDataWithPricing,
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
    });

    return {
      data: updatedTour,
      status: 'success',
      message: 'Tour actualizado correctamente'
    };
  }

  async remove(id: number): Promise<void> {
    // Check if tour exists
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!existingTour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    // Delete image files if they exist
    if (existingTour.images.length > 0) {
      const deleteImagePromises = existingTour.images.map(image => 
        this.deleteImage(image.url)
      );
      await Promise.all(deleteImagePromises);
    }

    // Delete tour (images and characteristics will be deleted automatically due to cascade)
    await this.prisma.tour.delete({
      where: { id },
    });
  }

  async getToursByCategory(tourCategoryId: number): Promise<ApiResponse<Tour[]>> {
    const tours = await this.prisma.tour.findMany({
      where: { tourCategoryId: tourCategoryId },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
        tourCategory: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: tours,
      status: 'success',
      message: `Tours de la categoría obtenidos correctamente`
    };
  }
} 