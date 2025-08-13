import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';

/**
 * DTO para crear tipos de yates
 * NOTA: NO enviar 'typeUser' desde el frontend - se valida automáticamente
 * Solo enviar: name, userId, stateId, municipalityId, localityId
 */
export class CreateYachtTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  stateId: number;

  @IsNumber()
  @IsNotEmpty()
  municipalityId: number;

  @IsNumber()
  @IsNotEmpty()
  localityId: number;
} 