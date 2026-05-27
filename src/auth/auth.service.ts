import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthRequestDto, AuthResponseDto, JwtPayloadDto } from '@/core/dtos';
import { PrismaService } from '@/framework/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private readonly logger = new Logger(AuthService.name);

  async signUp(dto: AuthRequestDto): Promise<AuthResponseDto> {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this._signToken(user.id, user.email);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async signIn(dto: AuthRequestDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const passwordMatches = await argon.verify(user.hash, dto.password);

    if (!passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this._signToken(user.id, user.email);
  }

  private async _signToken(
    userId: string,
    email: string,
  ): Promise<AuthResponseDto> {
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
