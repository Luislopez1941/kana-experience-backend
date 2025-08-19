import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength, IsArray, ValidateNested } from 'class-validator';
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

class CharacteristicDto {
  @IsString()
  @IsNotEmpty()
  name: string;
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CharacteristicDto)
  characteristics?: CharacteristicDto[];

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

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
