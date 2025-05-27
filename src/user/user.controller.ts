import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from 'src/core/dtos';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from './decorator';

@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('users')
export class UserController {
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the current user by its token' })
  @ApiOkResponse({ type: UserDto })
  @Get('me')
  getUserByAccessToken(@GetUser('') user: UserDto) {
    return user;
  }
}
