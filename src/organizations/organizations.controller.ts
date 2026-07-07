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
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
  OrganizationWithRoleDto,
  MemberDto,
  TransferOwnershipDto,
  DashboardResultDto,
  CreateTeamDto,
  TeamResponseDto,
  UpdateParticipantTeamDto,
  ParticipantResponseDto,
  SimulateTeamDto,
} from './dto/organizations.dto';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [OrganizationWithRoleDto] })
  @ApiOperation({ summary: 'List organizations of the current user' })
  async getUserOrganizations(
    @GetUser() user: UserDto,
  ): Promise<OrganizationWithRoleDto[]> {
    return this.orgService.getUserOrganizations(user.id);
  }

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
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
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
  @ApiOperation({ summary: 'List members of an organization (OWNER, MANAGER, EMPLOYEE)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getMembers(@Param('id') id: string): Promise<MemberDto[]> {
    return this.orgService.getMembers(id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Remove a member from the organization (OWNER/MANAGER only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'userId', description: 'Target user ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.orgService.removeMember(id, userId);
  }

  @Delete(':id/leave')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Leave the organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async leave(
    @GetUser() user: UserDto,
    @Param('id') id: string,
  ): Promise<void> {
    await this.orgService.leaveOrganization(id, user.id);
  }

  @Get(':id/results')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: DashboardResultDto })
  @ApiOperation({ summary: 'Get aggregated dashboard results for the organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team ID' })
  async getDashboardResults(
    @Param('id') id: string,
    @Query('teamId') teamId?: string,
  ): Promise<DashboardResultDto> {
    return this.orgService.getDashboardResults(id, teamId);
  }

  // ---- Ownership Transfer ----

  @Post(':id/transfer-ownership')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Initiate ownership transfer to another member' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async initiateTransfer(
    @GetUser() user: UserDto,
    @Param('id') id: string,
    @Body() dto: TransferOwnershipDto,
  ): Promise<void> {
    await this.orgService.initiateTransfer(id, user.id, dto.userId);
  }

  @Post(':id/transfer-ownership/cancel')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Cancel pending ownership transfer' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelTransfer(
    @GetUser() user: UserDto,
    @Param('id') id: string,
  ): Promise<void> {
    await this.orgService.cancelTransfer(id, user.id);
  }

  @Post(':id/accept-ownership')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Accept pending ownership transfer' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptOwnership(
    @GetUser() user: UserDto,
    @Param('id') id: string,
  ): Promise<void> {
    await this.orgService.acceptOwnership(id, user.id);
  }

  // ---- Teams ----

  @Get(':id/teams')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [TeamResponseDto] })
  @ApiOperation({ summary: 'List teams in the organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getTeams(@Param('id') id: string): Promise<TeamResponseDto[]> {
    return this.orgService.getTeams(id);
  }

  @Post(':id/teams')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: TeamResponseDto })
  @ApiOperation({ summary: 'Create a new team' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async createTeam(
    @Param('id') id: string,
    @Body() dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.orgService.createTeam(id, dto.name);
  }

  @Patch(':id/teams/:teamId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: TeamResponseDto })
  @ApiOperation({ summary: 'Rename a team' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async renameTeam(
    @Param('teamId') teamId: string,
    @Body() dto: CreateTeamDto,
  ): Promise<TeamResponseDto> {
    return this.orgService.renameTeam(teamId, dto.name);
  }

  @Delete(':id/teams/:teamId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Delete a team (unassigns members)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeam(@Param('teamId') teamId: string): Promise<void> {
    await this.orgService.deleteTeam(teamId);
  }

  @Post(':id/teams/:teamId/simulate')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: DashboardResultDto })
  @ApiOperation({ summary: 'Simulate adding a CANDIDATE to the team (read-only)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async simulateTeam(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
    @Body() dto: SimulateTeamDto,
  ): Promise<DashboardResultDto> {
    return this.orgService.simulateTeam(id, teamId, dto);
  }

  // ---- Participants ----

  @Get(':id/participants')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ParticipantResponseDto] })
  @ApiOperation({ summary: 'List participants (CANDIDATE and EMPLOYEE)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (CANDIDATE or EMPLOYEE)' })
  async getParticipants(
    @Param('id') id: string,
    @Query('status') status?: string,
  ): Promise<ParticipantResponseDto[]> {
    return this.orgService.getParticipants(id, status);
  }

  @Patch(':id/participants/:participantId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: ParticipantResponseDto })
  @ApiOperation({ summary: 'Update participant (team assignment, status change)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'participantId', description: 'Participant ID' })
  async updateParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body() dto: UpdateParticipantTeamDto,
  ): Promise<ParticipantResponseDto> {
    return this.orgService.updateParticipant(id, participantId, dto);
  }

  @Delete(':id/participants/:participantId')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Delete a participant' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'participantId', description: 'Participant ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteParticipant(
    @Param('participantId') participantId: string,
  ): Promise<void> {
    await this.orgService.deleteParticipant(participantId);
  }

  @Post(':id/members/:memberId/promote')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Promotion invitation sent' })
  @ApiOperation({ summary: 'Promote an EMPLOYEE member to MANAGER' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiParam({ name: 'memberId', description: 'OrganizationMember ID to promote' })
  @HttpCode(HttpStatus.OK)
  async promoteMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ): Promise<{ message: string }> {
    await this.orgService.promoteMember(id, memberId);
    return { message: 'Promotion invitation sent to the member' };
  }

  @Get(':id/candidates')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER, OrganizationRole.MANAGER)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ParticipantResponseDto] })
  @ApiOperation({ summary: 'List CANDIDATE participants with their results' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  async getCandidates(
    @Param('id') id: string,
  ): Promise<ParticipantResponseDto[]> {
    return this.orgService.getCandidates(id);
  }

  // ---- Organization Deletion ----

  @Delete(':id')
  @UseGuards(JwtGuard, OrganizationRolesGuard)
  @OrgRoles(OrganizationRole.OWNER)
  @ApiBearerAuth()
  @ApiNoContentResponse()
  @ApiOperation({ summary: 'Delete the organization and all its data' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.orgService.deleteOrganization(id);
  }
}
