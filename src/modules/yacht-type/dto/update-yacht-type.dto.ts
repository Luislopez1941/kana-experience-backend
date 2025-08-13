import { PartialType } from '@nestjs/mapped-types';
import { CreateYachtTypeDto } from './create-yacht-type.dto';

/**
 * DTO para actualizar tipos de yates
 * NOTA: NO enviar 'typeUser' desde el frontend - se valida automáticamente
 * Solo enviar los campos que se quieren actualizar: name, userId, stateId, municipalityId, localityId
 */
export class UpdateYachtTypeDto extends PartialType(CreateYachtTypeDto) {} 