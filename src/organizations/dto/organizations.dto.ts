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

  constructor(data: { id: string; name: string; createdAt: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
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
  @IsEnum(OrganizationRole, { message: 'Le rôle doit être un rôle valide (OWNER, MANAGER, MEMBER ou CANDIDATE)' })
  role: OrganizationRole;

  constructor(data: {
    id: string;
    name: string;
    createdAt: Date;
    role: OrganizationRole;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.role = data.role;
  }
}

export class MemberDto {
  @ApiProperty({
    description: 'The user ID',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  userId: string;

  @ApiProperty({
    description: 'The email of the member',
    example: 'jane@acme.com',
  })
  @Allow()
  email: string;

  @ApiPropertyOptional({
    description: 'The username of the member',
    example: 'JaneDoe',
  })
  @IsOptional()
  @Allow()
  username?: string;

  @ApiProperty({
    description: 'The role of the member in the organization',
    enum: OrganizationRole,
    example: 'MEMBER',
  })
  @IsEnum(OrganizationRole, { message: 'Le rôle doit être un rôle valide (OWNER, MANAGER, MEMBER ou CANDIDATE)' })
  role: OrganizationRole;

  @ApiProperty({
    description: 'The date when the member joined',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  joinedAt: Date;

  constructor(data: {
    userId: string;
    email: string;
    username?: string;
    role: OrganizationRole;
    joinedAt: Date;
  }) {
    this.userId = data.userId;
    this.email = data.email;
    this.username = data.username;
    this.role = data.role;
    this.joinedAt = data.joinedAt;
  }
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    description: 'The new role for the member',
    enum: [OrganizationRole.MANAGER, OrganizationRole.MEMBER],
    example: 'MANAGER',
  })
  @IsEnum(OrganizationRole, { message: 'Le rôle doit être MANAGER ou MEMBER' })
  role: OrganizationRole;
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
  @ApiProperty({ description: 'The user ID' })
  @Allow()
  userId: string;

  @ApiProperty({ description: 'The email of the member' })
  @Allow()
  email: string;

  @ApiPropertyOptional({ description: 'The username of the member' })
  @IsOptional()
  @Allow()
  username?: string;

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
    userId: string;
    email: string;
    username?: string;
    D: number;
    I: number;
    S: number;
    C: number;
  }) {
    this.userId = data.userId;
    this.email = data.email;
    this.username = data.username;
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
    description: 'Individual results of MEMBER members',
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
