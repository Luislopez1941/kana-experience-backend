import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class UpdateYachtDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
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
  @IsNumber()
  @Min(0)
  pricePerDay?: number;

  @IsOptional()
  @IsNumber()
  yachtTypeId?: number;
}
