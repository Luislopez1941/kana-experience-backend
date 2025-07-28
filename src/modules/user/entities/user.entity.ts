export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  phoneNumber?: string;
  profileImage?: string;
  roleId: number;
  role: Role;
  parentId?: number;
  parent?: User;
  subUsers?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export class Role {
  id: number;
  name: string;
  description?: string;
  permissions?: any;
  users?: User[];
  createdAt: Date;
  updatedAt: Date;
}
