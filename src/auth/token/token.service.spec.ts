import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from './token.service';
import { ConfigurationService } from '../../shared/configuration/configuration.service';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../jwt-payload';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('TokenService', () => {
  let service: TokenService;
  let configService: ConfigurationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: ConfigurationService,
          useValue: {
            JWT: {
              Key: 'testKey',
              AccessTokenTtl: 3600, // 1 hour for example
            },
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    configService = module.get<ConfigurationService>(ConfigurationService);
    jest.clearAllMocks();
  });

  describe('createAccessToken', () => {
    it('should return a valid access token', async () => {
      const payload: JwtPayload = { sub: '123' };
      const expectedToken = 'tokenString';
      (jwt.sign as jest.Mock).mockReturnValue(expectedToken);

      const token = await service.createAccessToken(payload);

      expect(token).toBeDefined();
      expect(token.accessToken).toEqual(expectedToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        configService.JWT.Key,
        expect.any(Object),
      );
    });
  });

  describe('decodeAndValidateJWT', () => {
    it('should decode and validate token', async () => {
      const testToken = 'testToken';
      const expectedPayload = { sub: '123', exp: Date.now() };
      (jwt.verify as jest.Mock).mockReturnValue(expectedPayload);

      const result = await service.decodeAndValidateJWT(testToken);

      expect(result).toEqual({ userId: expectedPayload.sub });
      expect(jwt.verify).toHaveBeenCalledWith(
        testToken,
        configService.JWT.Key,
        expect.any(Object),
      );
    });

    it('should return null if token validation fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await service.decodeAndValidateJWT('invalidToken');

      expect(result).toBeNull();
    });
  });

  describe('deleteToken / revokeToken', () => {
    it('should mark a token as revoked', async () => {
      const userId = '123';
      await service.deleteToken(userId);

      expect(service['usersExpired'][userId]).toBeDefined();
    });
  });
});
