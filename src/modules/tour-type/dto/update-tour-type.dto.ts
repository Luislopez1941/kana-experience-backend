import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateTourTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  image?: string; // Base64 image data or URL
} 