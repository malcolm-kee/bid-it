import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { CreateUserDto, LoginDto } from './user.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'User has been registered successfully',
  })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    return user;
  }

  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Login success',
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid email',
  })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.userService.getByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid Email');
    }

    return user;
  }
}
