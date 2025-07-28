import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTourTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
} 