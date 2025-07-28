import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateTourTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;
} 