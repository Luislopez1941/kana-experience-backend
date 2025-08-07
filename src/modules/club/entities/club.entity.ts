export class ClubImage {
  id: number;
  url: string;
  clubId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class ClubCharacteristic {
  id: number;
  name: string;
  clubId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Club {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  typeId: number;
  type?: ClubType;
  stateId: number;
  state?: State;
  municipalityId: number;
  municipality?: Municipality;
  localityId: number;
  locality?: Locality;
  images?: ClubImage[];
  characteristics?: ClubCharacteristic[];
  createdAt: Date;
  updatedAt: Date;
}

export class ClubType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class State {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Municipality {
  id: number;
  name: string;
  stateId: number;
  state?: State;
  createdAt: Date;
  updatedAt: Date;
}

export class Locality {
  id: number;
  name: string;
  municipalityId: number;
  municipality?: Municipality;
  createdAt: Date;
  updatedAt: Date;
} 