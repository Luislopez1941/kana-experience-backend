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

export class TourType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Tour {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  location: string;
  status: string;
  tourTypeId: number;
  tourType?: TourType;
  images?: TourImage[];
  characteristics?: TourCharacteristic[];
  createdAt: Date;
  updatedAt: Date;
} 