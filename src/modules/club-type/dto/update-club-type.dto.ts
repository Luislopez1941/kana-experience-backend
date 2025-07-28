import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateClubTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;
} 