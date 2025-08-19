import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateYachtDto } from './dto/create-yacht.dto';
import { UpdateYachtDto } from './dto/update-yacht.dto';
import { Yacht } from './entities/yacht.entity';
import { ApiResponse } from './types/api-response.type';

// DTO para filtrar yates
export interface FilterYachtsDto {
  stateId?: number;
  municipalityId?: number;
  localityId?: number;
  userId?: number;
  yachtCategoryId?: number;
  status?: string;
}

@Injectable()
export class YachtService {
  private readonly storageBucket = 'yachts'; // Bucket de Supabase Storage

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  async create(createYachtDto: CreateYachtDto): Promise<ApiResponse<Yacht>> {
    // Validar permisos del usuario - solo SUPER_ADMIN puede crear yates
    const user = await this.prisma.user.findUnique({
      where: { id: createYachtDto.userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${createYachtDto.userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido crear yates. Solo los usuarios SUPER_ADMIN pueden crear yates.');
    }

    // Check if yacht category exists
    const yachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id: createYachtDto.yachtCategoryId },
    });

    if (!yachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${createYachtDto.yachtCategoryId} not found`);
    }

    // Create yacht data without images and characteristics
    const { images, characteristics, pricing, ...yachtData } = createYachtDto;

    // Convert pricing array to JSON if provided
    const yachtDataWithPricing = {
      ...yachtData,
      pricing: pricing ? pricing as any : null,
    };

    const yacht = await this.prisma.yacht.create({
      data: yachtDataWithPricing,
      include: {
        yachtCategory: true,
        images: true,
        characteristics: true,
      },
    });

    // Process images if provided - Upload to Supabase Storage
    if (createYachtDto.images && createYachtDto.images.length > 0) {
      // Procesar las imágenes en el orden exacto del array
      for (let i = 0; i < createYachtDto.images.length; i++) {
        const base64 = createYachtDto.images[i];
        const filename = this.supabase.generateUniqueFileName(
          `${createYachtDto.name.replace(/\s+/g, '_').toLowerCase()}_${i + 1}.webp`,
          'yacht_'
        );
        
        // Upload to Supabase Storage
        const imageUrl = await this.supabase.uploadBase64Image(
          this.storageBucket,
          filename,
          base64
        );
        
        // Save image reference to database
        await this.prisma.yachtImage.create({
          data: {
            url: imageUrl,
            yachtId: yacht.id,
          },
        });
      }
    }

    // Process characteristics if provided
    if (createYachtDto.characteristics && createYachtDto.characteristics.length > 0) {
      const characteristicPromises = createYachtDto.characteristics.map(async (characteristic) => {
        return this.prisma.yachtCharacteristic.create({
          data: {
            name: characteristic.name,
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
        yachtCategory: true,
        images: true,
        characteristics: true,
      },
    });

    return {data: yachtWithImages!, status: 'success', message: 'Embarcación creada correctamente'};
  }

  async findAll(filterDto?: FilterYachtsDto): Promise<ApiResponse<Yacht[]>> {
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
      if (filterDto.yachtCategoryId) {
        whereClause.yachtCategoryId = filterDto.yachtCategoryId;
      }
      if (filterDto.status) {
        whereClause.status = filterDto.status;
      }
    }

    const yachts = await this.prisma.yacht.findMany({
      where: whereClause,
      include: {
        yachtCategory: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
      orderBy: { name: 'asc' },
      take: 8, // Límite de 8 elementos
    });

    return {data: yachts, status: 'success', message: 'Embarcaciones obtenidas correctamente'};
  }

  async findOne(id: number): Promise<Yacht> {
    const yacht = await this.prisma.yacht.findUnique({
      where: { id },
      include: {
        yachtCategory: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!yacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    return yacht;
  }

  async update(id: number, updateYachtDto: UpdateYachtDto): Promise<ApiResponse<Yacht>> {
    // Validar permisos del usuario - solo SUPER_ADMIN puede actualizar yates
    const user = await this.prisma.user.findUnique({
      where: { id: updateYachtDto.userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${updateYachtDto.userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido actualizar yates. Solo los usuarios SUPER_ADMIN pueden actualizar yates.');
    }

    // Prepare update data
    const { images, characteristics, delete_images, pricing, ...updateData } = updateYachtDto;

    // Convert pricing array to JSON if provided
    const updateDataWithPricing = {
      ...updateData,
      pricing: pricing ? pricing as any : undefined,
    };

    // Check if yacht exists
    const existingYacht = await this.prisma.yacht.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!existingYacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    // If yacht category is being updated, check if it exists
    if (updateYachtDto.yachtCategoryId) {
      const yachtCategory = await this.prisma.yachtCategory.findUnique({
        where: { id: updateYachtDto.yachtCategoryId },
      });

      if (!yachtCategory) {
        throw new NotFoundException(`Yacht category with ID ${updateYachtDto.yachtCategoryId} not found`);
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
        const deleteImagePromises = imagesToDelete.map(image => {
          // Extraer solo el nombre del archivo de la URL completa
          const filename = image.url.split('/').pop();
          if (!filename) {
            throw new Error(`Invalid image URL: ${image.url}`);
          }
          return this.supabase.deleteImage(this.storageBucket, filename);
        });
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
          const deleteImagePromises = urlsToDelete.map(url => {
            // Extraer solo el nombre del archivo de la URL completa
            const filename = url.split('/').pop();
            if (!filename) {
              throw new Error(`Invalid image URL: ${url}`);
            }
            return this.supabase.deleteImage(this.storageBucket, filename);
          });
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
        // Procesar las imágenes en el orden exacto del array
        for (let i = 0; i < newBase64Images.length; i++) {
          const base64 = newBase64Images[i];
          const filename = this.supabase.generateUniqueFileName(
            `${updateYachtDto.name || existingYacht.name.replace(/\s+/g, '_').toLowerCase()}_${i + 1}.webp`,
            'yacht_'
          );
          const imageUrl = await this.supabase.uploadBase64Image(
            this.storageBucket,
            filename,
            base64
          );
          
          await this.prisma.yachtImage.create({
            data: {
              url: imageUrl,
              yachtId: id,
            },
          });
        }
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
            name: characteristic.name,
            yachtId: id,
          },
        });
      });

      await Promise.all(characteristicPromises);
    }



    const updatedYacht = await this.prisma.yacht.update({
      where: { id },
      data: updateDataWithPricing,
      include: {
        yachtCategory: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    return {data: updatedYacht, status: 'success', message: 'Embarcación actualizada correctamente'};
  }

  async remove(id: number, userId: number): Promise<void> {
    // Validar permisos del usuario - solo SUPER_ADMIN puede eliminar yates
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido eliminar yates. Solo los usuarios SUPER_ADMIN pueden eliminar yates.');
    }

    // Check if yacht exists
    const existingYacht = await this.prisma.yacht.findUnique({
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

    if (!existingYacht) {
      throw new NotFoundException(`Yacht with ID ${id} not found`);
    }

    // Delete image files if they exist
    if (existingYacht.images.length > 0) {
      const deleteImagePromises = existingYacht.images.map(image => {
        // Extraer solo el nombre del archivo de la URL completa
        const filename = image.url.split('/').pop();
        if (!filename) {
          throw new Error(`Invalid image URL: ${image.url}`);
        }
        return this.supabase.deleteImage(this.storageBucket, filename);
      });
      await Promise.all(deleteImagePromises);
    }

    // Delete yacht (images and characteristics will be deleted automatically due to cascade)
    await this.prisma.yacht.delete({
      where: { id },
    });
  }

  async getYachtsByYachtCategory(userId: number, yachtCategoryId: number, page: number): Promise<ApiResponse<Yacht[]>> {
    // Validar permisos del usuario - solo SUPER_ADMIN puede ver yates
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { typeUser: true }
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    if (user.typeUser !== 'SUPER_ADMIN') {
      throw new ConflictException('Este usuario no está permitido ver yates. Solo los usuarios SUPER_ADMIN pueden acceder a las embarcaciones.');
    }

    const limit = 8; // Límite estático de 8 elementos por página
    const skip = (page - 1) * limit;
    
    // If yachtCategoryId is 0, return all yachts of the specific user with pagination
    if (yachtCategoryId === 0) {
      const yachts = await this.prisma.yacht.findMany({
        where: { userId }, // Filtrar por el usuario específico
        include: {
          yachtCategory: true,
          images: {
            orderBy: { createdAt: 'asc' }
          },
          characteristics: {
            orderBy: { createdAt: 'asc' }
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      });
      
      const total = await this.prisma.yacht.count({
        where: { userId }, // Contar solo los yates del usuario específico
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: yachts, 
        status: 'success', 
        message: `Todas las embarcaciones del usuario ${userId} obtenidas correctamente`,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      };
    }

    // Check if yacht category exists
    const yachtCategory = await this.prisma.yachtCategory.findUnique({
      where: { id: yachtCategoryId },
    });

    if (!yachtCategory) {
      throw new NotFoundException(`Yacht category with ID ${yachtCategoryId} not found`);
    }

    const yachts = await this.prisma.yacht.findMany({
      where: { 
        yachtCategoryId,
        userId // También filtrar por usuario específico
      },
      include: {
        yachtCategory: true,
        images: {
          orderBy: { createdAt: 'asc' }
        },
        characteristics: {
          orderBy: { createdAt: 'asc' }
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });
    
    const total = await this.prisma.yacht.count({
      where: { 
        yachtCategoryId,
        userId // Contar solo los yates de la categoría y usuario específicos
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: yachts, 
      status: 'success', 
      message: `Embarcaciones de la categoría ${yachtCategory.name} del usuario ${userId} obtenidas correctamente`,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    };
  }
}
