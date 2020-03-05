import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './user.dto';
import { User, USER_SCHEMA_NAME } from './user.type';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(USER_SCHEMA_NAME) private readonly userModel: Model<User>
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  getByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
