import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const req: LoginRequestDto = { email: 'test', password: 'test' };
      const response = { accessToken: 'someToken' };

      mockAuthService.login.mockResolvedValue(response);

      expect(await controller.login(req)).toEqual(response);
      expect(mockAuthService.login).toHaveBeenCalledWith(req);
    });
  });

  describe('register', () => {
    it('should return user data on successful registration', async () => {
      const registerDto: RegisterRequestDto = {
        firstName: 'test',
        lastName: 'test',
        password: 'test',
        email: 'test@example.com',
      };
      const response = { accessToken: 'someId', expiresIn: '30' };

      mockAuthService.register.mockResolvedValue(response);

      expect(await controller.register(registerDto)).toEqual(response);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('logout', () => {
    it('should return a success message on successful logout', async () => {
      const req = { user: { userId: 'someUserId' } };
      const response = undefined;

      mockAuthService.logout.mockResolvedValue(response);

      expect(await controller.logout(req)).toEqual(response);
      expect(mockAuthService.logout).toHaveBeenCalledWith(req.user.userId);
    });
  });
});
