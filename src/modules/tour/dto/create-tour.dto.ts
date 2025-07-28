import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MinLength } from 'class-validator';

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
  tourTypeId: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString({ each: true })
  characteristics?: string[];
} 