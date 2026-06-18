import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto, UpdateProfileDto } from './dto/user.dto';
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
    summary: 'Mettre à jour le profil de l\'utilisateur connecté',
  })
  @ApiResponse({ type: UserDto })
  @Patch('me')
  @HttpCode(200)
  async updateProfile(
    @GetUser('') user: UserDto,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserDto> {
    const updated = await this.userService.updateProfile(user.id, dto);
    return new UserDto({
      id: updated.id,
      email: updated.email,
      username: updated.username ?? undefined,
      firstName: updated.firstName ?? undefined,
      lastName: updated.lastName ?? undefined,
      birthDate: updated.birthDate ?? undefined,
      created_at: updated.created_at ?? undefined,
    });
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
