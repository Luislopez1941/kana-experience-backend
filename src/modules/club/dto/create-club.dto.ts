import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl, MinLength } from 'class-validator';

export class CreateClubDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsNumber()
  @IsNotEmpty()
  typeId: number;

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