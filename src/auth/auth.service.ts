import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthRequestDto, AuthResponseDto, JwtPayloadDto } from 'src/core/dtos';
import { PrismaService } from 'src/framework/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async signUp(dto: AuthRequestDto): Promise<AuthResponseDto> {
    try {
      // generate a password hash
      const hash = await argon.hash(dto.password);

      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // return jwt token
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Account already exists');
      }
      throw error;
    }
  }

  async signIn(dto: AuthRequestDto): Promise<AuthResponseDto> {
    try {
      // find the user by email
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      // if user does not exist, throw exception
      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }

      // compare password
      const passwordMatches = await argon.verify(user.hash, dto.password);
      // if password incorrect, throw exception
      if (!passwordMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }

      // return jwt token
      return this.signToken(user.id, user.email);
    } catch (error) {
      // throw exception
      throw error;
    }
  }

  async signToken(userId: string, email: string): Promise<AuthResponseDto> {
    const payload: JwtPayloadDto = {
      sub: userId,
      email,
    };

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30m',
      secret: process.env.JWT_SECRET,
    });

    return { access_token: token };
  }
}
