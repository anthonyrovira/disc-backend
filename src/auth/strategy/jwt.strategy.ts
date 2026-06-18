import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { JwtPayloadDto } from '@/auth/dto/auth.dto';
import { UserDto } from '@/user/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate({ sub }: JwtPayloadDto): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: sub },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid connection');
    }

    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      birthDate: user.birthDate,
    };

    return userDto;
  }
}
