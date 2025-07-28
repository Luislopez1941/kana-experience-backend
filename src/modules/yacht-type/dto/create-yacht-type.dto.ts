import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateYachtTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
} 