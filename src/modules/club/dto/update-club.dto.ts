import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl, MinLength } from 'class-validator';

export class UpdateClubDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;

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

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  typeId?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  stateId?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  municipalityId?: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  localityId?: number;
} 