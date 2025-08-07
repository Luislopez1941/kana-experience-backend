import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength, IsArray, ValidateNested } from 'class-validator';
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

export class UpdateYachtDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  length?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsNumber({}, { each: true })
  delete_images?: number[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

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

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  yachtCategoryId?: number;
}
