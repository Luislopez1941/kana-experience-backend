import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

export class UpdateTourDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  tourTypeId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];

  @IsOptional()
  @IsNumber({}, { each: true })
  delete_images?: number[];
} 