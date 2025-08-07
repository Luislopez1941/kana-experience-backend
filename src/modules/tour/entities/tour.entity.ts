export class TourImage {
  id: number;
  url: string;
  tourId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TourCharacteristic {
  id: number;
  name: string;
  tourId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TourCategory {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Tour {
  id: number;
  name: string;
  description: string;
  pricing?: any | null;
  location: string;
  status: string;
  horarios?: string | null;
  duracion?: string | null;
  edadMinima?: string | null;
  transportacion?: string | null;
  tourCategoryId: number;
  tourCategory?: TourCategory;
  images?: TourImage[];
  characteristics?: TourCharacteristic[];
  createdAt: Date;
  updatedAt: Date;
} 