export class Municipality {
  id: number;
  name: string;
  stateId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class State {
  id: number;
  name: string;
  municipalities?: Municipality[];
  createdAt: Date;
  updatedAt: Date;
} 