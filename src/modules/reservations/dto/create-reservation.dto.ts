import { IsString, IsEmail, IsInt, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsDateString()
  reservationDate: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  productId: number;

  @IsString()
  @IsIn(['yacht', 'tour', 'club'])
  type: string;

  @IsOptional()
  @IsString()
  qr?: string;

  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsInt()
  yachtId?: number;

  @IsOptional()
  @IsInt()
  tourId?: number;

  @IsOptional()
  @IsInt()
  clubId?: number;
}