import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';

@Injectable()
export class FolioService {
  constructor(private prisma: PrismaService) {}

  async generateFolio(): Promise<{ id: number; folio: number }> {
    const currentYear = new Date().getFullYear();
    const yearSuffix = parseInt(currentYear.toString().slice(-2)); // Obtener los últimos 2 dígitos del año como número

    // Buscar el último folio del año actual
    const lastFolio = await this.prisma.folio.findFirst({
      where: {
        year: currentYear,
      },
      orderBy: {
        number: 'desc',
      },
    });

    // Calcular el siguiente número secuencial
    const nextNumber = lastFolio ? lastFolio.number + 1 : 1;
    
    // Crear el folio completo (ej: 125 = folio 1 del año 2025)
    const folioNumber = parseInt(`${nextNumber}${yearSuffix.toString().padStart(2, '0')}`);

    // Crear el folio en la base de datos
    const newFolio = await this.prisma.folio.create({
      data: {
        number: nextNumber,
        year: currentYear,
        folio: folioNumber,
      },
    });

    return {
      id: newFolio.id,
      folio: newFolio.folio,
    };
  }

  async getFolioById(id: number) {
    return this.prisma.folio.findUnique({
      where: { id },
    });
  }

  async getFolioByNumber(folio: number) {
    return this.prisma.folio.findUnique({
      where: { folio },
      include: {
        reservations: {
          include: {
            yacht: {
              include: {
                images: true,
                characteristics: true,
              },
            },
            tour: {
              include: {
                images: true,
                characteristics: true,
              },
            },
            club: {
              include: {
                images: true,
                characteristics: true,
              },
            },
          },
        },
      },
    });
  }
}
