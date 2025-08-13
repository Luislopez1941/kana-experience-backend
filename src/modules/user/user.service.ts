import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserResponseDto } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        roleId: createUserDto.roleId || 3, // Default to USER role (ID 3)
      },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponseDto;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    // Remove passwords from response
    return users.map(({ password, ...user }) => user as unknown as UserResponseDto);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponseDto;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponseDto;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    return user as unknown as User;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is being updated, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (userWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if it's being updated
    let hashedPassword = existingUser.password;
    if (updateUserDto.password) {
      hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: hashedPassword,
      },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as unknown as UserResponseDto;
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { deleted: true };
  }

  async findSubUsers(parentId: number): Promise<UserResponseDto[]> {
    const subUsers = await this.prisma.user.findMany({
      where: { parentId },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    // Remove passwords from response
    return subUsers.map(({ password, ...user }) => user as unknown as UserResponseDto);
  }

  async findWithSubUsers(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        parent: true,
        subUsers: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as unknown as UserResponseDto;
  }
}
