import { YachtType } from '../../yacht-type/entities/yacht-type.entity';

export class YachtImage {
  id: number;
  url: string;
  yachtId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class YachtCharacteristic {
  id: number;
  name: string;
  yachtId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Yacht {
  id: number;
  name: string;
  capacity: number;
  length: string;
  location: string;
  description: string;
  features?: string | null;
  pricePerDay: number;
  yachtTypeId: number;
  yachtType?: YachtType;
  images?: YachtImage[];
  characteristics?: YachtCharacteristic[];
  createdAt: Date;
  updatedAt: Date;
}
