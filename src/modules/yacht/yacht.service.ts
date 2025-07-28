import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateYachtDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { Yacht } from './entities/yacht.entity';
import { ApiResponse } from './types/api-response.type';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class YachtService {
  private readonly uploadsDir = 'uploads';
  private readonly yachtsDir = 'yachts';

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    const uploadsPath = path.join(process.cwd(), this.uploadsDir);
    const yachtsPath = path.join(uploadsPath, this.yachtsDir);
    
    await fs.ensureDir(uploadsPath);
    await fs.ensureDir(yachtsPath);
  }

  private async saveBase64Image(base64Data: string, filename: string): Promise<string> {
    try {
      // Remove data:image/...;base64, prefix if present
      const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      
      // Clean filename: remove special characters and spaces, keep only alphanumeric, dots, and underscores
      const cleanFilename = filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single underscore
        .replace(/^_|_$/g, ''); // Remove leading and trailing underscores
      
      const uniqueFilename = `${timestamp}_${cleanFilename}`;
      const webpFilename = uniqueFilename.replace(/\.[^/.]+$/, '.webp');
      
      // Convert to WebP format
      const webpBuffer = await sharp(imageBuffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      // Save to file system
      const filePath = path.join(process.cwd(), this.uploadsDir, this.yachtsDir, webpFilename);
      await fs.writeFile(filePath, webpBuffer);
      
      // Return the relative path for database storage
      return `${this.uploadsDir}/${this.yachtsDir}/${webpFilename}`;
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
      console.error(`Error deleting image: ${error.message}`);
    }
  }

  async create(createYachtDto: CreateYachtDto): Promise<ApiResponse<Yacht>> {
    // Check if yacht type exists
    const yachtType = await this.prisma.yachtType.findUnique({
      where: { id: createYachtDto.yachtTypeId },
    });

    if (!yachtType) {
      throw new NotFoundException(`Yacht type with ID ${createYachtDto.yachtTypeId} not found`);
    }

    // Create yacht data without images and characteristics
    const { images, characteristics, ...yachtData } = createYachtDto;

    const yacht = await this.prisma.yacht.create({
      data: yachtData,
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
    });

    // Process images if provided
    if (createYachtDto.images && createYachtDto.images.length > 0) {
      const images = createYachtDto.images;
      const imagePromises = images.map(async (base64, index) => {
        const filename = `${createYachtDto.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
        const imageUrl = await this.saveBase64Image(base64, filename);
        
        return this.prisma.yachtImage.create({
          data: {
            url: imageUrl,
            yachtId: yacht.id,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Process characteristics if provided
    if (createYachtDto.characteristics && createYachtDto.characteristics.length > 0) {
      const characteristicPromises = createYachtDto.characteristics.map(async (characteristic) => {
        return this.prisma.yachtCharacteristic.create({
          data: {
            name: characteristic,
            yachtId: yacht.id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }

    // Fetch yacht with images and characteristics
    const yachtWithImages = await this.prisma.yacht.findUnique({
      where: { id: yacht.id },
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
    });

    return {data: yachtWithImages!, status: 'success', message: 'Embarcación creada correctamente'};
  }

  async findAll(): Promise<ApiResponse<Yacht[]>> {
    const yachts = await this.prisma.yacht.findMany({
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return {data: yachts, status: 'success', message: 'Embarcaciones obtenidas correctamente'};
  }

  async findOne(id: number): Promise<Yacht> {
    const yacht = await this.prisma.yacht.findUnique({
      where: { id },
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
    });

    if (!yacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    return yacht;
  }

  async update(id: number, updateYachtDto: UpdateYachtDto): Promise<ApiResponse<Yacht>> {
    // Prepare update data
    const { images, characteristics, delete_images, ...updateData } = updateYachtDto;

    // Check if yacht exists
    const existingYacht = await this.prisma.yacht.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!existingYacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    // If yacht type is being updated, check if it exists
    if (updateYachtDto.yachtTypeId) {
      const yachtType = await this.prisma.yachtType.findUnique({
        where: { id: updateYachtDto.yachtTypeId },
      });

      if (!yachtType) {
        throw new NotFoundException(`Yacht type with ID ${updateYachtDto.yachtTypeId} not found`);
      }
    }

    // Process delete_images if provided
    if (delete_images && delete_images.length > 0) {
      // Get images to delete by ID
      const imagesToDelete = await this.prisma.yachtImage.findMany({
        where: {
          id: { in: delete_images },
          yachtId: id,
        },
      });

      if (imagesToDelete.length > 0) {
        // Delete image files
        const deleteImagePromises = imagesToDelete.map(image => 
          this.deleteImage(image.url)
        );
        await Promise.all(deleteImagePromises);

        // Delete image records from database
        await this.prisma.yachtImage.deleteMany({
          where: {
            id: { in: delete_images },
            yachtId: id,
          },
        });
      }
    }

    // Process new images if provided
    if (updateYachtDto.images && updateYachtDto.images.length > 0) {
      // Separate existing URLs from new base64 images
      const existingUrls = updateYachtDto.images.filter(img => 
        typeof img === 'string' && !img.startsWith('data:image')
      );
      
      const newBase64Images = updateYachtDto.images.filter(img => 
        typeof img === 'string' && img.startsWith('data:image')
      );
      
      // Delete existing images that are not in the new list
      if (existingYacht.images.length > 0) {
        const existingImageUrls = existingYacht.images.map(img => img.url);
        const urlsToKeep = existingUrls.filter(url => existingImageUrls.includes(url));
        const urlsToDelete = existingImageUrls.filter(url => !urlsToKeep.includes(url));
        
        if (urlsToDelete.length > 0) {
          // Delete image files
          const deleteImagePromises = urlsToDelete.map(url => 
            this.deleteImage(url)
          );
          await Promise.all(deleteImagePromises);

          // Delete image records from database
          await this.prisma.yachtImage.deleteMany({
            where: { 
              yachtId: id,
              url: { in: urlsToDelete }
            },
          });
        }
      }
      
      // Save new base64 images
      if (newBase64Images.length > 0) {
        const imagePromises = newBase64Images.map(async (base64, index) => {
          const filename = `${updateYachtDto.name || existingYacht.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
          const imageUrl = await this.saveBase64Image(base64, filename);
          
          return this.prisma.yachtImage.create({
            data: {
              url: imageUrl,
              yachtId: id,
            },
          });
        });

        await Promise.all(imagePromises);
      }
    }

    // Process new characteristics if provided
    if (updateYachtDto.characteristics && updateYachtDto.characteristics.length > 0) {
      // Delete existing characteristics
      await this.prisma.yachtCharacteristic.deleteMany({
        where: { yachtId: id },
      });
      
      // Save new characteristics
      const characteristicPromises = updateYachtDto.characteristics.map(async (characteristic) => {
        return this.prisma.yachtCharacteristic.create({
          data: {
            name: characteristic,
            yachtId: id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }



    const updatedYacht = await this.prisma.yacht.update({
      where: { id },
      data: updateData,
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
    });

    return {data: updatedYacht, status: 'success', message: 'Embarcación actualizada correctamente'};
  }

  async remove(id: number): Promise<void> {
    // Check if yacht exists
    const existingYacht = await this.prisma.yacht.findUnique({
      where: { id },
      include: {
        images: true,
        characteristics: true,
      },
    });

    if (!existingYacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    // Delete image files if they exist
    if (existingYacht.images.length > 0) {
      const deleteImagePromises = existingYacht.images.map(image => 
        this.deleteImage(image.url)
      );
      await Promise.all(deleteImagePromises);
    }

    // Delete yacht (images and characteristics will be deleted automatically due to cascade)
    await this.prisma.yacht.delete({
      where: { id },
    });
  }

  async getYachtsByYachtType(yachtTypeId: number): Promise<ApiResponse<Yacht[]>> {
    // Check if yacht type exists
    const yachtType = await this.prisma.yachtType.findUnique({
      where: { id: yachtTypeId },
    });

    if (!yachtType) {
      throw new NotFoundException(`Yacht type with ID ${yachtTypeId} not found`);
    }

    const yachts = await this.prisma.yacht.findMany({
      where: { yachtTypeId },
      include: {
        yachtType: true,
        images: true,
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      data: yachts, 
      status: 'success', 
      message: `Embarcaciones del tipo ${yachtType.name} obtenidas correctamente`
    };
  }
}
