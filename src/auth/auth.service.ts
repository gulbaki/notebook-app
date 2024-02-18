import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Adjust the path as necessary
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.schema';
import { AccessToken } from './types/AccessToken';
import { RegisterRequestDto } from './dto/register-request.dto';
import { TokenService } from './token/token.service';
import { JwtPayload } from './jwt-payload';
import { LoginResponseDTO } from './dto/login-response.dto';
import { RegisterResponseDTO } from './dto/register-response.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import mongoose from 'mongoose';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  async login(user: LoginRequestDto): Promise<LoginResponseDTO> {
    const loginResults = await this.usersService.login(user);

    if (!loginResults) {
      return null;
    }

    const payload: JwtPayload = {
      sub: loginResults._id,
    };

    const loginResponse: LoginResponseDTO =
      await this.tokenService.createAccessToken(payload);

    return loginResponse;
  }
  async register(user: RegisterRequestDto): Promise<RegisterResponseDTO> {
    const existingUser = await this.usersService.findOneByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    if (!hashedPassword) {
      throw new BadRequestException('Password does not match');
    }

    const newUser: User = { ...user, password: hashedPassword };
    await this.usersService.create(newUser);
    return this.login(user);
  }

  async logout(userId: string): Promise<any> {
    await this.tokenService.deleteToken(userId);
  }
}
