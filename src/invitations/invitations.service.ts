import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  InvitationType,
  InvitationStatus,
  OrganizationRole,
} from '../../generated/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateInvitationDto,
  InvitationResponseDto,
  InvitationPreviewDto,
} from './dto/invitations.dto';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    userEmail: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    if (dto.email.toLowerCase() === userEmail.toLowerCase()) {
      throw new ForbiddenException('You cannot invite yourself');
    }

    if (dto.type === InvitationType.REFERRAL) {
      return this.createReferral(userId, dto);
    }

    return this.createOrgInvitation(userId, dto);
  }

  private async createOrgInvitation(
    userId: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    if (!dto.organizationId) {
      throw new ForbiddenException(
        'organizationId is required for TEAM_MEMBER and CANDIDATE invitations',
      );
    }

    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: dto.organizationId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== OrganizationRole.OWNER &&
        membership.role !== OrganizationRole.MANAGER)
    ) {
      throw new ForbiddenException(
        'You must be an OWNER or MANAGER of this organization to send invitations',
      );
    }

    const existing = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        organizationId: dto.organizationId,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      const org = await this.prisma.organization.findUnique({
        where: { id: dto.organizationId },
        select: { name: true },
      });

      throw new ConflictException(
        `A pending invitation already exists for ${dto.email} to ${org?.name || 'this organization'}`,
      );
    }

    return this.createInvitationRecord(userId, dto);
  }

  private async createReferral(
    userId: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    return this.createInvitationRecord(userId, {
      ...dto,
      organizationId: undefined,
    });
  }

  private async createInvitationRecord(
    userId: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email.toLowerCase(),
        type: dto.type,
        status: InvitationStatus.PENDING,
        token,
        organizationId: dto.organizationId ?? null,
        invitedByUserId: userId,
        expiresAt,
      },
      include: {
        organization: { select: { name: true } },
      },
    });

    return new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      type: invitation.type as InvitationType,
      status: invitation.status as InvitationStatus,
      token: invitation.token,
      organizationName: invitation.organization?.name,
      invitedByUserId: invitation.invitedByUserId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    });
  }

  async getUserInvitations(userId: string): Promise<InvitationResponseDto[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: { invitedByUserId: userId },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(
      (inv) =>
        new InvitationResponseDto({
          id: inv.id,
          email: inv.email,
          type: inv.type as InvitationType,
          status: inv.status as InvitationStatus,
          token: inv.token,
          organizationName: inv.organization?.name,
          invitedByUserId: inv.invitedByUserId,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        }),
    );
  }

  async preview(token: string): Promise<InvitationPreviewDto> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { name: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const expired = invitation.expiresAt < new Date();

    return new InvitationPreviewDto({
      email: invitation.email,
      type: invitation.type as InvitationType,
      organizationName: invitation.organization?.name,
      status: invitation.status as InvitationStatus,
      expiresAt: invitation.expiresAt,
      expired,
    });
  }

  async revoke(token: string, userId: string): Promise<void> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedByUserId !== userId) {
      throw new ForbiddenException('You can only revoke your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Only pending invitations can be revoked');
    }

    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.REVOKED },
    });
  }

  async accept(
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<void> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { name: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );
    }

    if (invitation.expiresAt < new Date()) {
      throw new GoneException('This invitation has expired');
    }

    if (invitation.status === InvitationStatus.REVOKED) {
      throw new GoneException('This invitation has been revoked');
    }

    if (invitation.status === InvitationStatus.EXPIRED) {
      throw new GoneException('This invitation has expired');
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      if (invitation.organizationId) {
        const role =
          invitation.type === InvitationType.CANDIDATE
            ? OrganizationRole.CANDIDATE
            : OrganizationRole.MEMBER;

        const existingMembership = await tx.organizationMembership.findUnique({
          where: {
            userId_organizationId: {
              userId,
              organizationId: invitation.organizationId,
            },
          },
        });

        if (!existingMembership) {
          await tx.organizationMembership.create({
            data: {
              userId,
              organizationId: invitation.organizationId,
              role,
              invitedById: invitation.invitedByUserId,
            },
          });
        }
      }
    });
  }
}
