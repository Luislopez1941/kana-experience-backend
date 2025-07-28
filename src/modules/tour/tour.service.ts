import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Tour } from './entities/tour.entity';
import { ApiResponse } from './types/api-response.type';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class TourService {
  private readonly uploadsDir = 'uploads';
  private readonly toursDir = 'tours';

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    const uploadsPath = path.join(process.cwd(), this.uploadsDir);
    const toursPath = path.join(uploadsPath, this.toursDir);
    
    await fs.ensureDir(uploadsPath);
    await fs.ensureDir(toursPath);
  }

  private async saveBase64Image(base64Data: string, filename: string): Promise<string> {
    try {
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const timestamp = Date.now();
      
      // Clean filename: remove special characters and spaces, keep only alphanumeric, dots, and underscores
      const cleanFilename = filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single underscore
        .replace(/^_|_$/g, ''); // Remove leading and trailing underscores
      
      const uniqueFilename = `${timestamp}_${cleanFilename}`;
      const webpFilename = uniqueFilename.replace(/\.[^/.]+$/, '.webp');
      
      const webpBuffer = await sharp(imageBuffer).webp({ quality: 80 }).toBuffer();
      const filePath = path.join(process.cwd(), this.uploadsDir, this.toursDir, webpFilename);
      await fs.writeFile(filePath, webpBuffer);
      
      return `${this.uploadsDir}/${this.toursDir}/${webpFilename}`;
    } catch (error) {
      throw new Error(`Error processing image: ${error.message}`);
    }
  }

  private async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), imagePath);
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
      }
    } catch (error) {
      console.error(`Error deleting image ${imagePath}:`, error);
    }
  }

  async create(createTourDto: CreateTourDto): Promise<ApiResponse<Tour>> {
    // Prepare tour data
    const { images, characteristics, ...tourData } = createTourDto;

    const tour = await this.prisma.tour.create({
      data: tourData,
      include: {
        images: true,
        characteristics: true,
        tourType: true,
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

    // Get the tour with images and characteristics
    const tourWithData = await this.prisma.tour.findUnique({
      where: { id: tour.id },
      include: {
        images: true,
        characteristics: true,
        tourType: true,
      },
    });

    if (!tourWithData) {
      throw new NotFoundException(`Tour with ID ${tour.id} not found`);
    }

    return {
      data: tourWithData,
      status: 'success',
      message: 'Tour creado correctamente'
    };
  }

  async findAll(): Promise<ApiResponse<Tour[]>> {
    const tours = await this.prisma.tour.findMany({
      include: {
        images: true,
        characteristics: true,
        tourType: true,
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
        images: true,
        characteristics: true,
        tourType: true,
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with ID ${id} not found`);
    }

    return tour;
  }

  async update(id: number, updateTourDto: UpdateTourDto): Promise<ApiResponse<Tour>> {
    // Prepare update data
    const { images, characteristics, delete_images, ...updateData } = updateTourDto;

    // Check if tour exists
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: true,
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
      data: updateData,
      include: {
        images: true,
        characteristics: true,
        tourType: true,
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
        images: true,
        characteristics: true,
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

  async getToursByType(tourTypeId: number): Promise<ApiResponse<Tour[]>> {
    const tours = await this.prisma.tour.findMany({
      where: { tourTypeId: tourTypeId },
      include: {
        images: true,
        characteristics: true,
        tourType: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: tours,
      status: 'success',
      message: `Tours del tipo obtenidos correctamente`
    };
  }
} 