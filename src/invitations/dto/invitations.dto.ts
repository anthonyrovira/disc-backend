import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Allow,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { InvitationType, InvitationStatus } from '../../../generated/prisma/client';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'The email of the person to invite',
    example: 'colleague@acme.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Type of invitation',
    enum: InvitationType,
    example: 'TEAM_MEMBER',
  })
  @IsEnum(InvitationType)
  type: InvitationType;

  @ApiPropertyOptional({
    description:
      'Organization ID (required for TEAM_MEMBER and EXTERNAL, ignored for REFERRAL)',
    example: 'f8e8d1e0-7e6e-11ea-bc55-0242ac130003',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
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
    description: 'Type of invitation',
    enum: InvitationType,
  })
  @IsEnum(InvitationType)
  type: InvitationType;

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

  @ApiPropertyOptional({
    description: 'Organization name if applicable',
    example: 'Acme Corp',
  })
  @IsOptional()
  @Allow()
  organizationName?: string;

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
    type: InvitationType;
    status: InvitationStatus;
    token: string;
    organizationName?: string;
    invitedByUserId: string;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.type = data.type;
    this.status = data.status;
    this.token = data.token;
    this.organizationName = data.organizationName;
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
    description: 'Type of invitation',
    enum: InvitationType,
  })
  @IsEnum(InvitationType)
  type: InvitationType;

  @ApiPropertyOptional({
    description: 'Name of the organization (if applicable)',
    example: 'Acme Corp',
  })
  @IsOptional()
  @Allow()
  organizationName?: string;

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
    type: InvitationType;
    organizationName?: string;
    status: InvitationStatus;
    expiresAt: Date;
    expired: boolean;
  }) {
    this.email = data.email;
    this.type = data.type;
    this.organizationName = data.organizationName;
    this.status = data.status;
    this.expiresAt = data.expiresAt;
    this.expired = data.expired;
  }
}
