import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthRequestDto {
  @ApiProperty({
    description: 'The email address',
    example: 'random.email@test.com',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty({ message: "L'email ne peut pas être vide" })
  email: string;

  @ApiProperty({
    description: 'The password',
    example: 'password',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'The access token',
    example: 'eyJhbGciOiJIUzI1N-PJievw8NBlE',
  })
  access_token: string;

  @ApiProperty({
    description: 'The refresh token',
    example: '4f8c2a1b...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Access token TTL in seconds',
    example: 900,
  })
  expires_in: number;
}

export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'The refresh token',
    example: '4f8c2a1b...',
  })
  @IsString({ message: 'Le refresh token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le refresh token ne peut pas être vide' })
  refresh_token: string;
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
