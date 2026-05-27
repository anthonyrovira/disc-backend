import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/framework/prisma/prisma.service';
import { JwtPayloadDto, UserDto } from '@/core/dtos';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate({ sub, email }: JwtPayloadDto): Promise<UserDto> {
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
    };

    return userDto;
  }
}
