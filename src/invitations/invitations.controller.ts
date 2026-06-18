import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  InvitationResponseDto,
  InvitationPreviewDto,
  CreateInvitationDto,
} from './dto/invitations.dto';
import { InvitationsService } from './invitations.service';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { GetUser } from '@/user/user.decorator';
import { UserDto } from '@/user/dto/user.dto';

@ApiTags('Invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: InvitationResponseDto })
  @ApiOperation({ summary: 'Create an invitation' })
  async create(
    @GetUser() user: UserDto,
    @Body() dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    return this.invitationsService.create(user.id, user.email, dto);
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [InvitationResponseDto] })
  @ApiOperation({ summary: 'List invitations sent by the current user' })
  async getUserInvitations(
    @GetUser() user: UserDto,
  ): Promise<InvitationResponseDto[]> {
    return this.invitationsService.getUserInvitations(user.id);
  }

  @Get(':token')
  @ApiOkResponse({ type: InvitationPreviewDto })
  @ApiOperation({ summary: 'Preview an invitation (public)' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  async preview(@Param('token') token: string): Promise<InvitationPreviewDto> {
    return this.invitationsService.preview(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiOperation({ summary: 'Accept an invitation' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @HttpCode(HttpStatus.OK)
  async accept(
    @GetUser() user: UserDto,
    @Param('token') token: string,
  ): Promise<void> {
    await this.invitationsService.accept(token, user.id, user.email);
  }

  @Post(':token/revoke')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @HttpCode(HttpStatus.OK)
  async revoke(
    @GetUser() user: UserDto,
    @Param('token') token: string,
  ): Promise<void> {
    await this.invitationsService.revoke(token, user.id);
  }
}
