import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Name for the user',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'Email for the user',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'Email for the user',
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}
