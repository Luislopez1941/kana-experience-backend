import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiResponse } from './types/api-response.type';
import * as sharp from 'sharp';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class ClubService {
  private readonly uploadsDir = 'uploads';
  private readonly clubsDir = 'clubs';

  constructor(private readonly prisma: PrismaService) {
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    const uploadsPath = path.join(process.cwd(), this.uploadsDir);
    const clubsPath = path.join(uploadsPath, this.clubsDir);
    
    await fs.ensureDir(uploadsPath);
    await fs.ensureDir(clubsPath);
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
      const filePath = path.join(process.cwd(), this.uploadsDir, this.clubsDir, webpFilename);
      await fs.writeFile(filePath, webpBuffer);
      
      // Return the relative path for database storage
      return `${this.uploadsDir}/${this.clubsDir}/${webpFilename}`;
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

    const { phone, website, images, characteristics, ...clubData } = createClubDto;
    
    const club = await this.prisma.club.create({
      data: clubData,
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    // Process images if provided
    if (createClubDto.images && createClubDto.images.length > 0) {
      const images = createClubDto.images;
      const imagePromises = images.map(async (base64, index) => {
        const filename = `${createClubDto.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
        const imageUrl = await this.saveBase64Image(base64, filename);
        
        return this.prisma.clubImage.create({
          data: {
            url: imageUrl,
            clubId: club.id,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Process characteristics if provided
    if (createClubDto.characteristics && createClubDto.characteristics.length > 0) {
      const characteristicPromises = createClubDto.characteristics.map(async (characteristic) => {
        return this.prisma.clubCharacteristic.create({
          data: {
            name: characteristic,
            clubId: club.id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }

    // Fetch club with images and characteristics
    const clubWithImages = await this.prisma.club.findUnique({
      where: { id: club.id },
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    return {
      data: clubWithImages!,
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
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
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
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
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

    const { phone, website, images, characteristics, ...updateData } = updateClubDto;
    
    const updatedClub = await this.prisma.club.update({
      where: { id },
      data: updateData,
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    // Process new images if provided
    if (updateClubDto.images && updateClubDto.images.length > 0) {
      // Delete existing images
      const existingImages = await this.prisma.clubImage.findMany({
        where: { clubId: id },
      });

      for (const image of existingImages) {
        await this.deleteImage(image.url);
      }

      await this.prisma.clubImage.deleteMany({
        where: { clubId: id },
      });

      // Add new images
      const imagePromises = updateClubDto.images.map(async (base64, index) => {
        const filename = `${(updateClubDto.name || existingClub.name).replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
        const imageUrl = await this.saveBase64Image(base64, filename);
        
        return this.prisma.clubImage.create({
          data: {
            url: imageUrl,
            clubId: id,
          },
        });
      });

      await Promise.all(imagePromises);
    }

    // Process new characteristics if provided
    if (updateClubDto.characteristics && updateClubDto.characteristics.length > 0) {
      // Delete existing characteristics
      await this.prisma.clubCharacteristic.deleteMany({
        where: { clubId: id },
      });

      // Add new characteristics
      const characteristicPromises = updateClubDto.characteristics.map(async (characteristic) => {
        return this.prisma.clubCharacteristic.create({
          data: {
            name: characteristic,
            clubId: id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }

    // Fetch updated club with images and characteristics
    const clubWithImages = await this.prisma.club.findUnique({
      where: { id },
      include: {
        type: true,
        state: true,
        municipality: true,
        locality: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    return {
      data: clubWithImages!,
      status: 'success',
      message: 'Club actualizado correctamente'
    };
  }

  async remove(id: number): Promise<ApiResponse<{ deleted: boolean }>> {
    // Check if club exists
    const existingClub = await this.prisma.club.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!existingClub) {
      throw new NotFoundException(`Club with ID ${id} not found`);
    }

    // Delete images from file system
    for (const image of existingClub.images) {
      await this.deleteImage(image.url);
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
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
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