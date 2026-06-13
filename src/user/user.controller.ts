import { Controller, Delete, Get, HttpCode, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from './user.decorator';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get the current user by its token' })
  @ApiResponse({ type: UserDto })
  @Get('me')
  getUserByAccessToken(@GetUser('') user: UserDto) {
    return user;
  }

  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete the current user account and all associated data',
  })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @Delete('me')
  @HttpCode(204)
  async deleteAccount(@GetUser('') user: UserDto): Promise<void> {
    await this.userService.deleteUser({ id: user.id });
  }
}
