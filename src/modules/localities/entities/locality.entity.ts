import { Municipality } from '../../municipality/entities/municipality.entity';

export class Locality {
  id: number;
  name: string;
  municipalityId: number;
  municipality?: Municipality;
  createdAt: Date;
  updatedAt: Date;
}
