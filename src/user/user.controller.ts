import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/core/dtos';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/user/decorator';

@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('users')
export class UserController {
  // constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ type: UserDto })
  @Get('me')
  getUserByAccessToken(@GetUser('') user: UserDto) {
    return user;
  }
}
