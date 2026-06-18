import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationRole,
  OwnershipTransferStatus,
} from '../../generated/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateOrganizationDto,
  MemberDto,
  OrganizationResponseDto,
  OrganizationWithRoleDto,
  DashboardResultDto,
  MemberResultDto,
} from './dto/organizations.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        members: {
          create: {
            userId,
            role: OrganizationRole.OWNER,
          },
        },
      },
    });

    return new OrganizationResponseDto(org);
  }

  async getUserOrganizations(
    userId: string,
  ): Promise<OrganizationWithRoleDto[]> {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map(
      (m) =>
        new OrganizationWithRoleDto({
          id: m.organization.id,
          name: m.organization.name,
          createdAt: m.organization.createdAt,
          role: m.role,
        }),
    );
  }

  async findById(organizationId: string): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return new OrganizationResponseDto(org);
  }

  async getMembers(organizationId: string): Promise<MemberDto[]> {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, email: true, username: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return memberships.map(
      (m) =>
        new MemberDto({
          userId: m.userId,
          email: m.user.email,
          username: m.user.username,
          role: m.role,
          joinedAt: m.joinedAt,
        }),
    );
  }

  async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<{
    userId: string;
    organizationId: string;
    role: OrganizationRole;
  } | null> {
    return this.prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
      },
    });
  }

  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    newRole: OrganizationRole,
  ): Promise<void> {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (membership.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Cannot change the role of the organization owner',
      );
    }

    if (newRole === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot promote a member to OWNER');
    }

    await this.prisma.organizationMembership.update({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
      data: { role: newRole },
    });
  }

  async removeMember(
    organizationId: string,
    targetUserId: string,
  ): Promise<void> {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (membership.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    await this.prisma.organizationMembership.delete({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });
  }

  async getDashboardResults(
    organizationId: string,
  ): Promise<DashboardResultDto> {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId, role: OrganizationRole.MEMBER },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            Form: {
              where: { status: 'completed' },
              select: {
                answers: {
                  select: {
                    optionValue: true,
                    Option: { select: { dimension: true } },
                  },
                },
              },
              orderBy: { updated_at: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const members: MemberResultDto[] = [];
    const totalScores = { D: 0, I: 0, S: 0, C: 0 };
    let membersWithResults = 0;

    for (const membership of memberships) {
      const latestForm = membership.user.Form[0];

      if (!latestForm) {
        members.push(
          new MemberResultDto({
            userId: membership.user.id,
            email: membership.user.email,
            username: membership.user.username,
            D: 0,
            I: 0,
            S: 0,
            C: 0,
          }),
        );
        continue;
      }

      const scores = { D: 0, I: 0, S: 0, C: 0 };
      for (const answer of latestForm.answers) {
        scores[answer.Option.dimension]++;
      }

      totalScores.D += scores.D;
      totalScores.I += scores.I;
      totalScores.S += scores.S;
      totalScores.C += scores.C;
      membersWithResults++;

      members.push(
        new MemberResultDto({
          userId: membership.user.id,
          email: membership.user.email,
          username: membership.user.username,
          ...scores,
        }),
      );
    }

    const averageScores =
      membersWithResults > 0
        ? {
            D: Math.round((totalScores.D / membersWithResults) * 10) / 10,
            I: Math.round((totalScores.I / membersWithResults) * 10) / 10,
            S: Math.round((totalScores.S / membersWithResults) * 10) / 10,
            C: Math.round((totalScores.C / membersWithResults) * 10) / 10,
          }
        : { D: 0, I: 0, S: 0, C: 0 };

    return new DashboardResultDto({
      averageScores,
      members,
      total: membersWithResults,
    });
  }

  async initiateTransfer(
    organizationId: string,
    currentOwnerId: string,
    targetUserId: string,
  ): Promise<void> {
    if (currentOwnerId === targetUserId) {
      throw new BadRequestException(
        'You are already the owner of this organization',
      );
    }

    const targetMembership =
      await this.prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: targetUserId,
            organizationId,
          },
        },
      });

    if (!targetMembership) {
      throw new NotFoundException(
        'Target user is not a member of this organization',
      );
    }

    const existingTransfer =
      await this.prisma.ownershipTransfer.findUnique({
        where: {
          organizationId_status: {
            organizationId,
            status: OwnershipTransferStatus.PENDING,
          },
        },
      });

    if (existingTransfer) {
      throw new ConflictException(
        'A pending ownership transfer already exists for this organization',
      );
    }

    await this.prisma.ownershipTransfer.create({
      data: {
        organizationId,
        fromUserId: currentOwnerId,
        toUserId: targetUserId,
        status: OwnershipTransferStatus.PENDING,
      },
    });
  }

  async cancelTransfer(
    organizationId: string,
    currentOwnerId: string,
  ): Promise<void> {
    const transfer = await this.prisma.ownershipTransfer.findUnique({
      where: {
        organizationId_status: {
          organizationId,
          status: OwnershipTransferStatus.PENDING,
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException(
        'No pending ownership transfer found for this organization',
      );
    }

    if (transfer.fromUserId !== currentOwnerId) {
      throw new ForbiddenException(
        'Only the current owner can cancel the transfer',
      );
    }

    await this.prisma.ownershipTransfer.update({
      where: { id: transfer.id },
      data: { status: OwnershipTransferStatus.CANCELLED },
    });
  }

  async acceptOwnership(
    organizationId: string,
    acceptingUserId: string,
  ): Promise<void> {
    const transfer = await this.prisma.ownershipTransfer.findUnique({
      where: {
        organizationId_status: {
          organizationId,
          status: OwnershipTransferStatus.PENDING,
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException(
        'No pending ownership transfer found for this organization',
      );
    }

    if (transfer.toUserId !== acceptingUserId) {
      throw new ForbiddenException(
        'You are not the designated recipient of this ownership transfer',
      );
    }

    await this.prisma.$transaction([
      this.prisma.organizationMembership.update({
        where: {
          userId_organizationId: {
            userId: transfer.fromUserId,
            organizationId,
          },
        },
        data: { role: OrganizationRole.MANAGER },
      }),
      this.prisma.organizationMembership.update({
        where: {
          userId_organizationId: {
            userId: transfer.toUserId,
            organizationId,
          },
        },
        data: { role: OrganizationRole.OWNER },
      }),
      this.prisma.ownershipTransfer.update({
        where: { id: transfer.id },
        data: {
          status: OwnershipTransferStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      }),
    ]);
  }

  async deleteOrganization(organizationId: string): Promise<void> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.prisma.organization.delete({
      where: { id: organizationId },
    });
  }
}
