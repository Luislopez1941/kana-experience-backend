import { YachtCategory } from '../../yacht-type/entities/yacht-type.entity';

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
  pricing?: any | null;
  status: string;
  yachtCategoryId: number;
  yachtCategory?: YachtCategory;
  images?: YachtImage[];
  characteristics?: YachtCharacteristic[];
  createdAt: Date;
  updatedAt: Date;
}
