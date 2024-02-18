import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Adjust the import path as necessary
import { TokenService } from './token/token.service';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock UsersService and TokenService
const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  login: jest.fn(),
};
const mockTokenService = {
  createAccessToken: jest.fn(),
  deleteToken: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks(); // Clear mock calls between tests
  });

  describe('register', () => {
    it('should throw a BadRequestException if the email already exists', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({});

      await expect(
        service.register({
          firstName: 'test',
          lastName: 'test',
          email: 'string',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully register a new user', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockImplementation((user) => user);
      mockUsersService.login.mockResolvedValue({ _id: 'someUserId' });
      mockTokenService.createAccessToken.mockResolvedValue({
        accessToken: 'someAccessToken',
      });

      const hashedPassword = await bcrypt.hash('password123', 10);
      const result = await service.register({
        firstName: 'test',
        lastName: 'test',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'someAccessToken' });
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'test',
          lastName: 'test',
          email: 'test@example.com',
          password: hashedPassword,
        }),
      );
    });
  });

  describe('login', () => {
    it('should return null if user login fails', async () => {
      mockUsersService.login.mockResolvedValue(null);

      const result = await service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('should return a login response on successful login', async () => {
      const user = { _id: 'someUserId' };
      mockUsersService.login.mockResolvedValue(user);
      mockTokenService.createAccessToken.mockResolvedValue({
        accessToken: 'someAccessToken',
      });

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'someAccessToken' });
    });
  });

  describe('logout', () => {
    it('should call tokenService.deleteToken with the correct userId', async () => {
      const userId = 'someUserId';
      await service.logout(userId);
      expect(mockTokenService.deleteToken).toHaveBeenCalledWith(userId);
    });
  });
});
