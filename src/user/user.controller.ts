import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from '@/core/dtos';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from './decorator';

@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('users')
export class UserController {
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the current user by its token' })
  @ApiResponse({ type: UserDto })
  @Get('me')
  getUserByAccessToken(@GetUser('') user: UserDto) {
    return user;
  }
}
