import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { FolioService } from '../folio/folio.service';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private folioService: FolioService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    // Generar folio automáticamente
    const folioData = await this.folioService.generateFolio();

    const reservation = await this.prisma.reservation.create({
      data: {
        ...createReservationDto,
        reservationDate: new Date(createReservationDto.reservationDate),
        status: createReservationDto.status || 'pending',
        folioId: folioData.id,
      },
    });

    return {
      data: reservation, 
      status: 'success', 
      message: 'Reservación creada correctamente',
      folio: folioData.folio
    };
  }

  async findAll() {
    const reservations = await this.prisma.reservation.findMany({
      include: {
        folio: true, // Incluir la información del folio
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
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return {
      data: reservations,
      status: 'success',
      message: 'Reservaciones obtenidas correctamente',
    };
  }

  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto): Promise<Reservation> {
    const existingReservation = await this.findOne(id);

    const updateData: any = { ...updateReservationDto };
    
    if (updateReservationDto.reservationDate) {
      updateData.reservationDate = new Date(updateReservationDto.reservationDate);
    }

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    return reservation;
  }

  async remove(id: number): Promise<Reservation> {
    const existingReservation = await this.findOne(id);

    return this.prisma.reservation.delete({
      where: { id },
    });
  }

  async findByProductId(productId: number, type: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: {
        productId,
        type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByStatus(status: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { status },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEmail(email: string): Promise<Reservation[]> {
    return this.prisma.reservation.findMany({
      where: { email },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByFolio(folio: string) {
    return this.folioService.getFolioByNumber(parseInt(folio));
  }
}