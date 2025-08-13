import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PricingItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  personas: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio: number;
}

export class CreateTourDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tourCategoryId: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingItemDto)
  pricing?: PricingItemDto[];

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  horarios?: string;

  @IsOptional()
  @IsString()
  duracion?: string;

  @IsOptional()
  @IsString()
  edadMinima?: string;

  @IsOptional()
  @IsString()
  transportacion?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];

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