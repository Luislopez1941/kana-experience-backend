import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, MinLength, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class PricingItemDto {
  @IsOptional()
  @IsString()
  hour?: string;  // Para formato "09:00", "14:00"

  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;  // Para formato 8, 9, 10 (horas)

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;
}

export class CreateYachtDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity: number;

  @IsString()
  @IsNotEmpty()
  length: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  features?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingItemDto)
  pricing?: PricingItemDto[];

  @IsOptional()
  @IsString()
  status?: string;

  @IsNumber()
  @Type(() => Number)
  yachtCategoryId: number;

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
