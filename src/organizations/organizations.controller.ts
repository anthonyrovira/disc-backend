import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationRole } from '../../generated/prisma/client';
import { JwtGuard } from '@/auth/guard/jwt.guard';
import { OrgRoles, OrganizationRolesGuard } from '@/common/guards/org-roles.guard';
import { GetUser } from '@/user/user.decorator';
import { UserDto } from '@/user/dto/user.dto';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationDto,
  OrganizationResponseDto,
  MemberDto,
  UpdateMemberRoleDto,
  DashboardResultDto,
} from './dto/organizations.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: OrganizationResponseDto })
  @ApiOperation({ summary: 'Create a new organization' })
  async create(
    @GetUser() user: UserDto,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    return this.orgService.create(user.id, dto);
  }

  @Get(':id')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER, OrganizationRole.MEMBER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: OrganizationResponseDto })
  @ApiOperation({ summary: 'Get organization details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async findById(@Param('id') id: string): Promise<OrganizationResponseDto> {
    return this.orgService.findById(id);
  }

  @Get(':id/members')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [MemberDto] })
  @ApiOperation({ summary: 'List members of an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getMembers(@Param('id') id: string): Promise<MemberDto[]> {
    return this.orgService.getMembers(id);
  }

  @Patch(':id/members/:userId/role')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Change a member role (OWNER only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<void> {
    await this.orgService.updateMemberRole(id, userId, dto.role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Remove a member from the organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.orgService.removeMember(id, userId);
  }

  @Get(':id/results')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: DashboardResultDto })
  @ApiOperation({ summary: 'Get aggregated dashboard results for the organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getDashboardResults(
    @Param('id') id: string,
  ): Promise<DashboardResultDto> {
    return this.orgService.getDashboardResults(id);
  }
}
