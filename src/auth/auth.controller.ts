import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthRequestDto, AuthResponseDto } from 'src/core/dtos';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'JWT Token' })
  @Post('signup')
  async signUp(@Body() dto: AuthRequestDto) {
    return this.authService.signUp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({ type: AuthResponseDto, description: 'JWT Token' })
  @Post('login')
  async signIn(@Body() dto: AuthRequestDto) {
    return this.authService.signIn(dto);
  }
}
