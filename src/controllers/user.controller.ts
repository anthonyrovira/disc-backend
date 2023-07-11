import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from 'src/models/data/user.model';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: User })
  @Post()
  createUser(@Body() userData: User) {
    return this.userService.createUser(userData);
  }
}
