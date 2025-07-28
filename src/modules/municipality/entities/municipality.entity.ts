export class Municipality {
  id: number;
  name: string;
  stateId: number;
  state?: State;
  localities?: Locality[];
  createdAt: Date;
  updatedAt: Date;
}

export class State {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Locality {
  id: number;
  name: string;
  municipalityId: number;
  createdAt: Date;
  updatedAt: Date;
} 