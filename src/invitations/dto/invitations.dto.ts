import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { InvitationTargetStatus, InvitationStatus } from '../../../generated/prisma/client';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'The email of the person to invite',
    example: 'colleague@acme.com',
  })
  @IsEmail({}, { message: "Format d'email invalide" })
  @IsNotEmpty({ message: "L'email ne peut pas être vide" })
  email: string;

  @ApiProperty({
    description: 'The first name of the person to invite',
    example: 'John',
  })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide' })
  firstName: string;

  @ApiPropertyOptional({
    description: 'The last name of the person to invite',
    example: 'Doe',
  })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  lastName?: string;

  @ApiProperty({
    description: 'Target status after acceptance',
    enum: InvitationTargetStatus,
    example: 'EMPLOYEE',
  })
  @IsEnum(InvitationTargetStatus, {
    message: 'Le type doit être CANDIDATE, EMPLOYEE ou MANAGER',
  })
  targetStatus: InvitationTargetStatus;

  @ApiProperty({
    description: 'Organization ID',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsUUID('all', { message: "L'identifiant de l'organisation doit être un UUID valide" })
  @IsNotEmpty({ message: "L'identifiant de l'organisation ne peut pas être vide" })
  organizationId: string;

  @ApiPropertyOptional({
    description: 'Team ID to assign the invited person to',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsOptional()
  @IsUUID('all', { message: "L'identifiant de l'équipe doit être un UUID valide" })
  teamId?: string;
}

export class InvitationResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the invitation',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  id: string;

  @ApiProperty({
    description: 'The email of the invited person',
    example: 'colleague@acme.com',
  })
  @Allow()
  email: string;

  @ApiProperty({
    description: 'The first name of the invited person',
    example: 'John',
  })
  @Allow()
  firstName: string;

  @ApiPropertyOptional({
    description: 'The last name of the invited person',
    example: 'Doe',
  })
  @IsOptional()
  @Allow()
  lastName?: string;

  @ApiProperty({
    description: 'Target status of the invitation',
    enum: InvitationTargetStatus,
  })
  @IsEnum(InvitationTargetStatus)
  targetStatus: InvitationTargetStatus;

  @ApiProperty({
    description: 'Current status of the invitation',
    enum: InvitationStatus,
  })
  @IsEnum(InvitationStatus)
  status: InvitationStatus;

  @ApiProperty({
    description: 'The invitation token',
    example: 'a1b2c3d4e5f6...',
  })
  @Allow()
  token: string;

  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corp',
  })
  @Allow()
  organizationName: string;

  @ApiPropertyOptional({
    description: 'Team name if assigned',
    example: 'Engineering',
  })
  @IsOptional()
  @Allow()
  teamName?: string;

  @ApiProperty({
    description: 'ID of the user who sent the invitation',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @Allow()
  invitedByUserId: string;

  @ApiProperty({
    description: 'Expiration date of the invitation',
    example: '2024-01-29T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiProperty({
    description: 'Creation date of the invitation',
    example: '2024-01-15T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  constructor(data: {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    targetStatus: InvitationTargetStatus;
    status: InvitationStatus;
    token: string;
    organizationName: string;
    teamName?: string;
    invitedByUserId: string;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.targetStatus = data.targetStatus;
    this.status = data.status;
    this.token = data.token;
    this.organizationName = data.organizationName;
    this.teamName = data.teamName;
    this.invitedByUserId = data.invitedByUserId;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
  }
}

export class InvitationPreviewDto {
  @ApiProperty({
    description: 'The email of the invited person',
    example: 'colleague@acme.com',
  })
  @Allow()
  email: string;

  @ApiProperty({
    description: 'The first name of the invited person',
    example: 'John',
  })
  @Allow()
  firstName: string;

  @ApiPropertyOptional({
    description: 'The last name of the invited person',
    example: 'Doe',
  })
  @IsOptional()
  @Allow()
  lastName?: string;

  @ApiProperty({
    description: 'Target status of the invitation',
    enum: InvitationTargetStatus,
  })
  @IsEnum(InvitationTargetStatus)
  targetStatus: InvitationTargetStatus;

  @ApiProperty({
    description: 'Name of the organization',
    example: 'Acme Corp',
  })
  @Allow()
  organizationName: string;

  @ApiPropertyOptional({
    description: 'Team name if assigned',
    example: 'Engineering',
  })
  @IsOptional()
  @Allow()
  teamName?: string;

  @ApiProperty({
    description: 'Current status of the invitation',
    enum: InvitationStatus,
  })
  @IsEnum(InvitationStatus)
  status: InvitationStatus;

  @ApiProperty({
    description: 'Expiration date of the invitation',
    example: '2024-01-29T10:00:00Z',
  })
  @Allow()
  @IsDate()
  @Type(() => Date)
  expiresAt: Date;

  @ApiProperty({
    description: 'Whether the invitation has expired',
    example: false,
  })
  @Allow()
  expired: boolean;

  constructor(data: {
    email: string;
    firstName: string;
    lastName?: string;
    targetStatus: InvitationTargetStatus;
    organizationName: string;
    teamName?: string;
    status: InvitationStatus;
    expiresAt: Date;
    expired: boolean;
  }) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.targetStatus = data.targetStatus;
    this.organizationName = data.organizationName;
    this.teamName = data.teamName;
    this.status = data.status;
    this.expiresAt = data.expiresAt;
    this.expired = data.expired;
  }
}

export class SetupPasswordDto {
  @ApiProperty({
    description: 'The new password for the account',
    example: 'securePassword123',
  })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe ne peut pas être vide' })
  password: string;
}

export class AcceptInvitationResponseDto {
  @ApiProperty({
    description: 'The invitation token',
  })
  @Allow()
  token: string;

  @ApiProperty({
    description: 'Target status',
    enum: InvitationTargetStatus,
  })
  targetStatus: InvitationTargetStatus;

  @ApiPropertyOptional({
    description: 'The form ID if a test was created',
  })
  @IsOptional()
  @Allow()
  formId?: string;

  @ApiPropertyOptional({
    description: 'Redirect URL for the test',
  })
  @IsOptional()
  @Allow()
  redirectUrl?: string;

  constructor(data: {
    token: string;
    targetStatus: InvitationTargetStatus;
    formId?: string;
    redirectUrl?: string;
  }) {
    this.token = data.token;
    this.targetStatus = data.targetStatus;
    this.formId = data.formId;
    this.redirectUrl = data.redirectUrl;
  }
}

export class SetupPasswordResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  @Allow()
  accessToken: string;

  @ApiPropertyOptional({
    description: 'The form ID if a test was created',
  })
  @IsOptional()
  @Allow()
  formId?: string;

  constructor(data: { accessToken: string; formId?: string }) {
    this.accessToken = data.accessToken;
    this.formId = data.formId;
  }
}
