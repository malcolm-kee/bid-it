import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserSchema } from './user.schema';
import { UserService } from './user.service';
import { USER_SCHEMA_NAME } from './user.type';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: USER_SCHEMA_NAME,
          schema: UserSchema,
        },
      ],
      'users'
    ),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
