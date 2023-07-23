import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/dtos/data/user/user.dto';
import { UserService } from 'src/services/user/user.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Post a new user' })
  @ApiOkResponse({ type: User })
  @Post()
  createUser(@Body() userData: User) {
    return this.userService.createUser(userData);
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiOkResponse({ type: User })
  @Get(':id')
  getUserById(@Param('id') id: string): User | undefined {
    return this.userService.getUserById(id);
  }
}
