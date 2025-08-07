import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, MinLength, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class PricingItemDto {
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  hora: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio: number;
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
}
