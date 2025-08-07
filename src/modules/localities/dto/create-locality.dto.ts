import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLocalityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  municipalityId: number;
}
