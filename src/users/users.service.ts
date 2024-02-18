import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { LoginRequestDto } from 'src/auth/dto/login-request.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return null;
    }
    return user;
  }
  async login(loginObject: LoginRequestDto): Promise<User | undefined> {
    const { email, password } = loginObject;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Email or password incorrect');
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('Email or password incorrect');
    }

    return user;
  }
  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  async create(user: User): Promise<User> {
    return await this.userModel.create(user);
  }

  async removeToken(userId: string): Promise<any> {
    return await this.userModel.findByIdAndDelete({ _id: userId });
  }
}
