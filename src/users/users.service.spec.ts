import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';

// Mock user data
const testUserForLogin = {
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 10),
};
const testUserForRegister = {
  firstName: 'baki',
  lastName: 'tes',
  email: 'test@example.com',
  password: bcrypt.hashSync('password123', 10),
};

// Mock Mongoose model
const mockUserModel = {
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks(); // Clear mock calls between tests
  });

  describe('findOneByEmail', () => {
    it('should return a user if user is found', async () => {
      mockUserModel.findOne.mockResolvedValue(testUserForLogin);
      const user = await service.findOneByEmail('test@example.com');
      expect(user).toEqual(testUserForLogin);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
    });

    it('should return null if user is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const user = await service.findOneByEmail('notfound@example.com');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should throw a BadRequestException if email is not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow('Email or password incorrect');
    });

    it('should throw a BadRequestException if password does not match', async () => {
      mockUserModel.findOne.mockResolvedValue(testUserForLogin);
      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow('Email or password incorrect');
    });

    it('should return the user if login is successful', async () => {
      mockUserModel.findOne.mockResolvedValue(testUserForLogin);
      const user = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(user).toEqual(testUserForLogin);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockUserModel.create.mockResolvedValue(testUserForRegister);
      const user = await service.create(testUserForRegister);
      expect(user).toEqual(testUserForRegister);
      expect(mockUserModel.create).toHaveBeenCalledWith(testUserForRegister);
    });
  });

  // Add tests for `findById` and `removeToken` as needed following the same pattern
});
