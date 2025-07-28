import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    
    // Si el usuario no existe
    if (!user) {
      return { error: 'email_not_found' };
    }
    
    // Si la contraseña es incorrecta
    if (!(await bcrypt.compare(password, user.password))) {
      return { error: 'invalid_password' };
    }
    
    // Usuario válido
    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const validationResult = await this.validateUser(loginDto.email, loginDto.password);
    
    // Si hay un error de validación
    if (validationResult.error) {
      let message = 'Credenciales incorrectas. Verifica tu email y contraseña.';
      
      if (validationResult.error === 'email_not_found') {
        message = 'El email no está registrado en el sistema.';
      } else if (validationResult.error === 'invalid_password') {
        message = 'La contraseña es incorrecta.';
      }
      
      return {
        status: 'warning',
        message,
        access_token: null,
        user: null,
        expiresIn: null,
      };
    }

    const payload = {
      email: validationResult.email,
      sub: validationResult.id,
      role: validationResult.role,
    };

    // Configure token expiration based on remember option
    const expiresIn = loginDto.remember ? '30d' : '7d';

    return {
      access_token: this.jwtService.sign(payload, { expiresIn }),
      user: {
        id: validationResult.id,
        email: validationResult.email,
        firstName: validationResult.firstName,
        lastName: validationResult.lastName,
        role: validationResult.role,
      },
      status: 'success',
      message: 'Inicio de sesión exitoso',
      expiresIn,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = await this.userService.create(registerDto);

    // Generate JWT token
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number): Promise<User> {
    return this.userService.findOne(userId);
  }
}
