import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, MinLength } from 'class-validator';

export class CreateYachtDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsNumber()
  @Min(1)
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

  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsNumber()
  yachtTypeId: number;
}
