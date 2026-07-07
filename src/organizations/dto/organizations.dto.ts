import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Allow,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrganizationRole } from '../../../generated/prisma/client';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'Acme Corp',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide' })
  name: string;
}

export class PendingTransferDto {
  @ApiProperty({
    description: 'The user ID of the designated new owner',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  toUserId: string;

  @ApiProperty({
    description: 'The full name of the designated new owner',
    example: 'Jane Doe',
  })
  @Allow()
  toUserName: string;

  constructor(data: { toUserId: string; toUserName: string }) {
    this.toUserId = data.toUserId;
    this.toUserName = data.toUserName;
  }
}

export class OrganizationResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the organization',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({
    description: 'The name of the organization',
    example: 'Acme Corp',
  })
  @Allow()
  name: string;

  @ApiProperty({
    description: 'The date when the organization was created',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Pending ownership transfer, if any',
    type: PendingTransferDto,
    nullable: true,
  })
  @IsOptional()
  @Allow()
  pendingTransfer?: PendingTransferDto | null;

  constructor(data: {
    id: string;
    name: string;
    createdAt: Date;
    pendingTransfer?: PendingTransferDto | null;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.pendingTransfer = data.pendingTransfer ?? null;
  }
}

export class OrganizationWithRoleDto {
  @ApiProperty({
    description: 'The unique identifier of the organization',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({
    description: 'The name of the organization',
    example: 'Acme Corp',
  })
  @Allow()
  name: string;

  @ApiProperty({
    description: 'The date when the organization was created',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'The role of the current user in this organization',
    enum: OrganizationRole,
    example: 'OWNER',
  })
  @IsEnum(OrganizationRole, { message: 'Le rôle doit être OWNER ou MANAGER' })
  role: OrganizationRole;

  @ApiPropertyOptional({
    description: 'Pending ownership transfer, if any',
    type: PendingTransferDto,
    nullable: true,
  })
  @IsOptional()
  @Allow()
  pendingTransfer?: PendingTransferDto | null;

  constructor(data: {
    id: string;
    name: string;
    createdAt: Date;
    role: OrganizationRole;
    pendingTransfer?: PendingTransferDto | null;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.role = data.role;
    this.pendingTransfer = data.pendingTransfer ?? null;
  }
}

export class MemberDto {
  @ApiProperty({
    description: 'The user ID (for OWNER/MANAGER) or participant ID (for EMPLOYEE)',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({
    description: 'The email of the member',
    example: 'jane@acme.com',
  })
  @Allow()
  email: string;

  @ApiPropertyOptional({
    description: 'The first name of the member',
  })
  @IsOptional()
  @Allow()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'The last name of the member',
  })
  @IsOptional()
  @Allow()
  lastName?: string;

  @ApiProperty({
    description: 'The role of the member',
    enum: OrganizationRole,
    example: 'EMPLOYEE',
  })
  @Allow()
  role: OrganizationRole;

  @ApiPropertyOptional({
    description: 'Team ID if assigned to a team',
  })
  @IsOptional()
  @Allow()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Team name if assigned to a team',
  })
  @IsOptional()
  @Allow()
  teamName?: string;

  @ApiProperty({
    description: 'The date when the member joined',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  joinedAt: Date;

  @ApiPropertyOptional({
    description: 'Date of the most recent DISC test linked to this organization',
  })
  @IsOptional()
  @Allow()
  @IsDate()
  @Type(() => Date)
  lastTestDate?: Date;

  constructor(data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: OrganizationRole;
    teamId?: string;
    teamName?: string;
    joinedAt: Date;
    lastTestDate?: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role;
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.joinedAt = data.joinedAt;
    this.lastTestDate = data.lastTestDate;
  }
}

export class TransferOwnershipDto {
  @ApiProperty({
    description: 'The user ID of the member to become the new OWNER',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsUUID('all', { message: "L'identifiant utilisateur doit être un UUID valide" })
  @IsNotEmpty({ message: "L'identifiant utilisateur ne peut pas être vide" })
  userId: string;
}

export class MemberResultDto {
  @ApiProperty({ description: 'The user or participant ID' })
  @Allow()
  id: string;

  @ApiProperty({ description: 'The email of the member' })
  @Allow()
  email: string;

  @ApiPropertyOptional({ description: 'The first name of the member' })
  @IsOptional()
  @Allow()
  firstName?: string;

  @ApiPropertyOptional({ description: 'The last name of the member' })
  @IsOptional()
  @Allow()
  lastName?: string;

  @ApiProperty({ description: 'D score', example: 8 })
  @Allow()
  D: number;

  @ApiProperty({ description: 'I score', example: 5 })
  @Allow()
  I: number;

  @ApiProperty({ description: 'S score', example: 3 })
  @Allow()
  S: number;

  @ApiProperty({ description: 'C score', example: 4 })
  @Allow()
  C: number;

  constructor(data: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    D: number;
    I: number;
    S: number;
    C: number;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.D = data.D;
    this.I = data.I;
    this.S = data.S;
    this.C = data.C;
  }
}

export class DashboardResultDto {
  @ApiProperty({
    description: 'Average D/I/S/C scores across the team',
    example: { D: 6.5, I: 5.2, S: 4.1, C: 3.8 },
  })
  @Allow()
  @IsObject()
  averageScores: { D: number; I: number; S: number; C: number };

  @ApiProperty({
    description: 'Individual results of members',
    type: MemberResultDto,
    isArray: true,
  })
  @Allow()
  @Type(() => MemberResultDto)
  members: MemberResultDto[];

  @ApiProperty({
    description: 'Total number of members with results',
    example: 12,
  })
  @Allow()
  total: number;

  constructor(data: {
    averageScores: { D: number; I: number; S: number; C: number };
    members: MemberResultDto[];
    total: number;
  }) {
    this.averageScores = data.averageScores;
    this.members = data.members;
    this.total = data.total;
  }
}

export class SimulateTeamDto {
  @ApiProperty({
    description: 'The participant ID (CANDIDATE) to simulate inclusion of',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsUUID('all', { message: "L'identifiant du participant doit être un UUID valide" })
  @IsNotEmpty({ message: "L'identifiant du participant ne peut pas être vide" })
  participantId: string;
}

export class CreateTeamDto {
  @ApiProperty({
    description: 'The name of the team',
    example: 'Engineering',
  })
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide' })
  name: string;
}

export class TeamResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the team',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({
    description: 'The name of the team',
    example: 'Engineering',
  })
  @Allow()
  name: string;

  @ApiProperty({
    description: 'The date when the team was created',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  constructor(data: { id: string; name: string; createdAt: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
  }
}

export class UpdateParticipantTeamDto {
  @ApiPropertyOptional({
    description: 'Team ID to assign the participant to',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsOptional()
  @IsUUID('all', { message: "L'identifiant de l'équipe doit être un UUID valide" })
  teamId?: string;
}

export class ParticipantResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the participant',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({ description: 'The email of the participant' })
  @Allow()
  email: string;

  @ApiProperty({ description: 'The first name of the participant' })
  @Allow()
  firstName: string;

  @ApiPropertyOptional({ description: 'The last name of the participant' })
  @IsOptional()
  @Allow()
  lastName?: string;

  @ApiProperty({ description: 'The status of the participant', example: 'CANDIDATE' })
  @Allow()
  status: string;

  @ApiPropertyOptional({
    description: 'Team ID if assigned',
  })
  @IsOptional()
  @Allow()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'Team name if assigned',
  })
  @IsOptional()
  @Allow()
  teamName?: string;

  @ApiProperty({
    description: 'The date when the participant was created',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Date of the most recent completed test',
  })
  @IsOptional()
  @Allow()
  @IsDate()
  @Type(() => Date)
  lastTestDate?: Date;

  constructor(data: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    status: string;
    teamId?: string;
    teamName?: string;
    createdAt: Date;
    lastTestDate?: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.status = data.status;
    this.teamId = data.teamId;
    this.teamName = data.teamName;
    this.createdAt = data.createdAt;
    this.lastTestDate = data.lastTestDate;
  }
}
