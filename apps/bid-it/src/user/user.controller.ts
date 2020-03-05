import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginDto } from './user.dto';
import { Response } from 'express';
import { ApiResponse } from '@nestjs/swagger';

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
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const user = await this.userService.getByEmail(loginDto.email);

    if (!user) {
      return response.status(403).json({
        message: 'Invalid Email',
      });
    }

    return user;
  }
}
