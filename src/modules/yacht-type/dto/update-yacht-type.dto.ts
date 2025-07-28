import { PartialType } from '@nestjs/mapped-types';
import { CreateYachtTypeDto } from './create-yacht-type.dto';

export class UpdateYachtTypeDto extends PartialType(CreateYachtTypeDto) {} 