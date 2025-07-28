import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateClubTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
} 