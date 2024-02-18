import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { AuthGuard } from '@nestjs/passport';
import { RegisterRequestDto } from './dto/register-request.dto';
import { LoginResponseDTO } from './dto/login-response.dto';
import { RegisterResponseDTO } from './dto/register-response.dto';
import { Public } from './decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login-request.dto';
import { User } from './decorators/user.decorator';
import { JwtAuthGuard } from './auth.guard';

@Public()
@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: LoginRequestDto })
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) req: LoginRequestDto,
  ): Promise<LoginResponseDTO | BadRequestException> {
    return this.authService.login(req);
  }

  @Post('register')
  @ApiBody({ type: RegisterRequestDto })
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) registerBody: RegisterRequestDto,
  ): Promise<RegisterResponseDTO | BadRequestException> {
    return await this.authService.register(registerBody);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async logout(@Req() req): Promise<any> {
    const userId = req.user.userId;
    await this.authService.logout(userId);
    return { message: 'ok' };
  }
}
