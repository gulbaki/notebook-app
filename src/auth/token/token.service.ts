import { Injectable, Logger } from '@nestjs/common';
import { sign, SignOptions, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { ConfigurationService } from '../../shared/configuration/configuration.service';
import { JwtPayload } from '../jwt-payload';
import { LoginResponseDTO } from '../dto/login-response.dto';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  private readonly jwtOptions: SignOptions;
  private readonly jwtKey: string;
  private expiresInDefault: number;

  private readonly usersExpired: number[] = [];

  constructor(private readonly configurationService: ConfigurationService) {
    this.expiresInDefault = this.configurationService.JWT.AccessTokenTtl;
    this.jwtOptions = { expiresIn: this.expiresInDefault };
    this.jwtKey = this.configurationService.JWT.Key;
  }

  async createAccessToken(
    payload: JwtPayload,
    expires = this.expiresInDefault,
  ): Promise<LoginResponseDTO> {
    // If expires is negative it means that token should not expire
    const options = this.jwtOptions;
    expires > 0 ? (options.expiresIn = expires) : delete options.expiresIn;
    // Generate unique id for this token
    options.jwtid = uuidv4();
    const signedPayload = sign(payload, this.jwtKey, options);
    const token: LoginResponseDTO = {
      accessToken: signedPayload,
      expiresIn: expires,
    };

    return token;
  }

  async decodeAndValidateJWT(token: string): Promise<any> {
    if (token) {
      try {
        const payload = await this.validateToken(token);
        return await this.validatePayload(payload);
      } catch (error) {
        return null;
      }
    }
  }

  async validatePayload(payload: JwtPayload): Promise<any> {
    const tokenBlacklisted = await this.isBlackListed(payload.sub, payload.exp);
    if (!tokenBlacklisted) {
      return {
        userId: payload.sub,
      };
    }
    return null;
  }

  private async validateToken(
    token: string,
    ignoreExpiration: boolean = false,
  ): Promise<JwtPayload> {
    return verify(token, this.configurationService.JWT.Key, {
      ignoreExpiration,
    }) as JwtPayload;
  }

  private async isBlackListed(id: string, expire: number): Promise<boolean> {
    return this.usersExpired[id] && expire < this.usersExpired[id];
  }

  async deleteToken(userId: string) {
    await this.revokeToken(userId);
  }
  private async revokeToken(userId: string): Promise<any> {
    this.usersExpired[userId] = moment().add(this.expiresInDefault, 's').unix();
  }
}
