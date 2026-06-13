import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthRequestDto, AuthResponseDto, JwtPayloadDto } from './dto/auth.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

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

      const access_token = await this._signAccessToken(user.id, user.email);
      const refresh_token = await this.refreshTokenService.generate(user.id);

      return { access_token, refresh_token, expires_in: 900 };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  async signIn(dto: AuthRequestDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    if (!user.hash) {
      throw new ForbiddenException(
        'This email uses Google login. Please sign in with Google.',
      );
    }

    const passwordMatches = await argon.verify(user.hash, dto.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const access_token = await this._signAccessToken(user.id, user.email);
    const refresh_token = await this.refreshTokenService.generate(user.id);

    return { access_token, refresh_token, expires_in: 900 };
  }

  async refresh(rawToken: string): Promise<AuthResponseDto> {
    return this.refreshTokenService.rotate(rawToken);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenService.revokeAll(userId);
  }

  async googleLogin(user: {
    email: string;
    googleId: string;
    username: string;
  }): Promise<AuthResponseDto> {
    let existing = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existing) {
      if (existing.hash) {
        throw new ConflictException(
          'An account with this email already uses password login. Please sign in with your email and password.',
        );
      }

      if (existing.googleId !== user.googleId) {
        existing = await this.prisma.user.update({
          where: { id: existing.id },
          data: { googleId: user.googleId },
        });
      }
    } else {
      existing = await this.prisma.user.create({
        data: {
          email: user.email,
          googleId: user.googleId,
          username: user.username,
        },
      });
    }

    const access_token = await this._signAccessToken(existing.id, existing.email);
    const refresh_token = await this.refreshTokenService.generate(existing.id);

    return { access_token, refresh_token, expires_in: 900 };
  }

  private async _signAccessToken(
    userId: string,
    email: string,
  ): Promise<string> {
    const payload: JwtPayloadDto = { sub: userId, email };
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }
}
