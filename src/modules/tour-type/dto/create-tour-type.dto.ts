import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';

export class CreateTourTypeDto {
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