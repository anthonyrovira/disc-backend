import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequestDto } from 'src/core/dtos';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: String, description: 'JWT Token' })
  @Post('signup')
  async signUp(@Body() dto: AuthRequestDto) {
    console.log({ dto });
    return this.authService.signUp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: String, description: 'JWT Token' })
  @Post('login')
  async signIn(@Body() dto: AuthRequestDto) {
    return this.authService.signIn(dto);
  }
}
