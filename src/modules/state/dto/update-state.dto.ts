import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateStateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;
} 