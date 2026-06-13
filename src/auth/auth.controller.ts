import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthRequestDto,
  AuthResponseDto,
  RefreshTokenRequestDto,
} from './dto/auth.dto';
import { JwtGuard } from './guard';
import { GetUser } from '@/user';
import { UserDto } from '@/user/dto/user.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiResponse({ type: AuthResponseDto, description: 'Tokens' })
  @Post('signup')
  async signUp(@Body() dto: AuthRequestDto): Promise<AuthResponseDto> {
    return this.authService.signUp(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ type: AuthResponseDto, description: 'Tokens' })
  @Post('login')
  async signIn(@Body() dto: AuthRequestDto): Promise<AuthResponseDto> {
    return this.authService.signIn(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ type: AuthResponseDto, description: 'New tokens' })
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refresh(dto.refresh_token);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
  @Post('logout')
  async logout(@GetUser() user: UserDto): Promise<void> {
    await this.authService.logout(user.id);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(): Promise<void> {
    // Redirects to Google — never called
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    const tokens = await this.authService.googleLogin(req.user);
    const frontendUrl =
      process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const query = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: String(tokens.expires_in),
    }).toString();
    res.redirect(`${frontendUrl}/auth/callback?${query}`);
  }
}
