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

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tourCategoryId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingItemDto)
  pricing?: PricingItemDto[];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

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
  @IsNumber({}, { each: true })
  delete_images?: number[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];
} 