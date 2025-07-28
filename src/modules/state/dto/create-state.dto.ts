import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
} 