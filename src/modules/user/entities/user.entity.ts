export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  typeUser: string;
  roleId: number;
  role: Role;
  parentId?: number | null;
  parent?: User | null;
  subUsers?: User[];
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseDto {
  id: number;
  email: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  secondLastName?: string | null;
  phoneNumber?: string | null;
  profileImage?: string | null;
  typeUser: string;
  roleId: number;
  role: Role;
  parentId?: number | null;
  parent?: UserResponseDto | null;
  subUsers?: UserResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class Role {
  id: number;
  name: string;
  description?: string | null;
  permissions?: any;
  users?: User[];
  createdAt: Date;
  updatedAt: Date;
}
