import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from 'src/models/data/user.model';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

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
