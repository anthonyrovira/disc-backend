import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthRequestDto {
  @ApiProperty({
    description: 'The email address',
    example: 'random.email@test.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhbGciOiJIUzI1N-PJievw8NBlE',
  })
  access_token: string;
}

export class JwtPayloadDto {
  @ApiProperty({
    description: 'The user ID',
    example: '1',
  })
  sub: string;

  @ApiProperty({
    description: 'The user email',
    example: 'random.email@test.com',
  })
  email: string;
}
