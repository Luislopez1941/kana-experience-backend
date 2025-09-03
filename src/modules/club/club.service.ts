import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar clubs
export interface FilterClubsDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
  typeId?: number;
}

@Injectable()
export class ClubService {
  private readonly storageBucket = 'clubs'; // Bucket de Supabase Storage

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  private async saveBase64Image(base64Data: string, filename: string): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const uniqueFilename = this.supabase.generateUniqueFileName(filename, 'club_');
      
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
      console.error(`Error deleting image: ${error.message}`);
    }
  }

  async create(createClubDto: CreateClubDto): Promise<ApiResponse<Club>> {
    // Convert typeId 0 to null
    if (createClubDto.typeId === 0) {
      (createClubDto as any).typeId = null;
    }

    // Check if club type exists (only if typeId is provided)
    if (createClubDto.typeId) {
      const clubType = await this.prisma.clubType.findUnique({
        where: { id: createClubDto.typeId },
      });

      if (!clubType) {
        throw new NotFoundException(`Club type with ID ${createClubDto.typeId} not found`);
      }
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

    // Save images if provided
    if (images && images.length > 0) {
      const imagePromises = images.map(async (base64, index) => {
        const filename = `${clubData.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
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

    // Save characteristics if provided
    if (characteristics && characteristics.length > 0) {
      const characteristicPromises = characteristics.map(async (characteristic) => {
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
    const clubWithData = await this.prisma.club.findUnique({
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
      data: clubWithData!,
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
      message: 'Todos los clubs obtenidos correctamente'
    };
  }

  async findAllClubs(filterDto?: FilterClubsDto): Promise<ApiResponse<Club[]>> {
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
      if (filterDto.typeId) {
        whereClause.typeId = filterDto.typeId;
      }
    }

    const clubs = await this.prisma.club.findMany({
      where: whereClause,
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
    // Prepare update data
    const { images, characteristics, delete_images, phone, website, ...updateData } = updateClubDto;
    
    // Convert typeId 0 to null
    if (updateData.typeId === 0) {
      (updateData as any).typeId = null;
    }
    
    console.log('Original typeId:', updateClubDto.typeId);
    console.log('Processed typeId:', updateData.typeId);

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

    // Validate club type if being updated (treat 0 as null)
    if (updateClubDto.typeId && updateClubDto.typeId !== 0) {
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

    // Process delete_images if provided
    if (delete_images && delete_images.length > 0) {
      // Get images to delete by ID
      const imagesToDelete = await this.prisma.clubImage.findMany({
        where: {
          id: { in: delete_images },
          clubId: id,
        },
      });

      if (imagesToDelete.length > 0) {
        // Delete image files
        const deleteImagePromises = imagesToDelete.map(image => 
          this.deleteImage(image.url)
        );
        await Promise.all(deleteImagePromises);

        // Delete image records from database
        await this.prisma.clubImage.deleteMany({
          where: {
            id: { in: delete_images },
            clubId: id,
          },
        });
      }
    }

    // Process new images if provided
    if (updateClubDto.images && updateClubDto.images.length > 0) {
      // Separate existing URLs from new base64 images
      const existingUrls = updateClubDto.images.filter(img => 
        typeof img === 'string' && !img.startsWith('data:image')
      );
      
      const newBase64Images = updateClubDto.images.filter(img => 
        typeof img === 'string' && img.startsWith('data:image')
      );
      
      // Delete existing images that are not in the new list
      if (existingClub.images.length > 0) {
        const existingImageUrls = existingClub.images.map(img => img.url);
        const urlsToKeep = existingUrls.filter(url => existingImageUrls.includes(url));
        const urlsToDelete = existingImageUrls.filter(url => !urlsToKeep.includes(url));
        
        if (urlsToDelete.length > 0) {
          // Delete image files
          const deleteImagePromises = urlsToDelete.map(url => 
            this.deleteImage(url)
          );
          await Promise.all(deleteImagePromises);

          // Delete image records from database
          await this.prisma.clubImage.deleteMany({
            where: { 
              clubId: id,
              url: { in: urlsToDelete }
            },
          });
        }
      }
      
      // Save new base64 images
      if (newBase64Images.length > 0) {
        const imagePromises = newBase64Images.map(async (base64, index) => {
          const filename = `${updateClubDto.name || existingClub.name.replace(/\s+/g, '_').toLowerCase()}_${index + 1}.jpg`;
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
    }

    // Process new characteristics if provided
    if (updateClubDto.characteristics && updateClubDto.characteristics.length > 0) {
      // Delete existing characteristics
      await this.prisma.clubCharacteristic.deleteMany({
        where: { clubId: id },
      });
      
      // Save new characteristics
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

    return {
      data: updatedClub,
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

  async getWithoutType(): Promise<ApiResponse<Club[]>> {
    const clubs = await this.prisma.club.findMany({
      where: { typeId: null },
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
      message: 'Clubs sin tipo obtenidos correctamente'
    };
  }
} 