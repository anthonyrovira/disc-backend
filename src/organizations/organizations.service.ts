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
import { PendingTransferDto } from './dto/organizations.dto';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateOrganizationDto,
  MemberDto,
  OrganizationResponseDto,
  OrganizationWithRoleDto,
  DashboardResultDto,
  MemberResultDto,
  TeamResponseDto,
  ParticipantResponseDto,
  UpdateParticipantTeamDto,
  SimulateTeamDto,
} from './dto/organizations.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        members: {
          create: {
            userId,
            email: user.email,
            firstName: user.firstName,
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
    const members = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
      orderBy: { joinedAt: 'asc' },
    });

    const orgIds = members.map((m) => m.organization.id);

    const pendingTransfers = orgIds.length > 0
      ? await this.prisma.ownershipTransfer.findMany({
          where: {
            organizationId: { in: orgIds },
            status: OwnershipTransferStatus.PENDING,
          },
          include: {
            toUser: { select: { id: true, firstName: true, lastName: true } },
          },
        })
      : [];

    const transferMap = new Map(
      pendingTransfers.map((t) => [
        t.organizationId,
        new PendingTransferDto({
          toUserId: t.toUser.id,
          toUserName:
            `${t.toUser.firstName}${t.toUser.lastName ? ` ${t.toUser.lastName}` : ''}`,
        }),
      ]),
    );

    return members.map(
      (m) =>
        new OrganizationWithRoleDto({
          id: m.organization.id,
          name: m.organization.name,
          createdAt: m.organization.createdAt,
          role: m.role,
          pendingTransfer: transferMap.get(m.organization.id) ?? null,
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

    const pendingTransfer = await this.prisma.ownershipTransfer.findUnique({
      where: {
        organizationId_status: {
          organizationId,
          status: OwnershipTransferStatus.PENDING,
        },
      },
      include: {
        toUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return new OrganizationResponseDto({
      id: org.id,
      name: org.name,
      createdAt: org.createdAt,
      pendingTransfer: pendingTransfer
        ? new PendingTransferDto({
            toUserId: pendingTransfer.toUser.id,
            toUserName:
              `${pendingTransfer.toUser.firstName}${pendingTransfer.toUser.lastName ? ` ${pendingTransfer.toUser.lastName}` : ''}`,
          })
        : null,
    });
  }

  async getMembers(organizationId: string): Promise<MemberDto[]> {
    const formLinks = await this.prisma.formOrganization.findMany({
      where: { organizationId },
      include: {
        form: {
          select: { memberId: true, updated_at: true, status: true },
        },
      },
      orderBy: { form: { updated_at: 'desc' } },
    });

    const memberLastTestMap = new Map<string, Date>();
    for (const link of formLinks) {
      if (link.form.status !== 'completed' || !link.form.memberId) continue;
      if (!memberLastTestMap.has(link.form.memberId)) {
        memberLastTestMap.set(link.form.memberId, link.form.updated_at!);
      }
    }

    const allMembers = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return allMembers.map(
      (m) =>
        new MemberDto({
          id: m.userId ?? m.id,
          email: m.email,
          firstName: m.firstName ?? undefined,
          lastName: m.lastName ?? undefined,
          role: m.role,
          teamId: m.team?.id,
          teamName: m.team?.name,
          joinedAt: m.joinedAt,
          lastTestDate: memberLastTestMap.get(m.id),
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
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      select: {
        userId: true,
        organizationId: true,
        role: true,
      },
    });

    if (!member || !member.userId) return null;
    return member as { userId: string; organizationId: string; role: OrganizationRole };
  }

  async removeMember(
    organizationId: string,
    targetUserId: string,
  ): Promise<void> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new ForbiddenException('Cannot remove the organization owner');
    }

    await this.prisma.organizationMember.delete({
      where: { id: member.id },
    });
  }

  async getDashboardResults(
    organizationId: string,
    teamId?: string,
  ): Promise<DashboardResultDto> {
    const formLinks = await this.prisma.formOrganization.findMany({
      where: { organizationId },
      include: {
        form: {
          include: {
            member: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                userId: true,
                teamId: true,
                team: { select: { name: true } },
              },
            },
            answers: {
              select: {
                optionValue: true,
                Option: { select: { dimension: true } },
              },
            },
          },
        },
      },
      orderBy: { form: { updated_at: 'desc' } },
    });

    const memberLatestForm = new Map<string, typeof formLinks[0]['form']>();

    for (const link of formLinks) {
      if (link.form.status !== 'completed') continue;
      if (link.form.member?.id && !memberLatestForm.has(link.form.member.id)) {
        memberLatestForm.set(link.form.member.id, link.form);
      }
    }

    const allMembers = await this.prisma.organizationMember.findMany({
      where: {
        organizationId,
        ...(teamId ? { teamId } : {}),
      },
    });

    const members: MemberResultDto[] = [];
    const totalScores = { D: 0, I: 0, S: 0, C: 0 };
    let membersWithResults = 0;

    for (const member of allMembers) {
      const form = memberLatestForm.get(member.id);

      if (!form) {
        members.push(
          new MemberResultDto({
            id: member.userId ?? member.id,
            email: member.email,
            firstName: member.firstName ?? undefined,
            lastName: member.lastName ?? undefined,
            D: 0, I: 0, S: 0, C: 0,
          }),
        );
        continue;
      }

      const scores = { D: 0, I: 0, S: 0, C: 0 };
      for (const answer of form.answers) {
        scores[answer.Option.dimension]++;
      }

      totalScores.D += scores.D;
      totalScores.I += scores.I;
      totalScores.S += scores.S;
      totalScores.C += scores.C;
      membersWithResults++;

      members.push(
        new MemberResultDto({
          id: member.userId ?? member.id,
          email: member.email,
          firstName: member.firstName ?? undefined,
          lastName: member.lastName ?? undefined,
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

    const targetMember = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundException(
        'Target user is not a member of this organization',
      );
    }

    const existingTransfer = await this.prisma.ownershipTransfer.findUnique({
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
      this.prisma.organizationMember.update({
        where: {
          userId_organizationId: {
            userId: transfer.fromUserId,
            organizationId,
          },
        },
        data: { role: OrganizationRole.MANAGER },
      }),
      this.prisma.organizationMember.update({
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

  async leaveOrganization(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this organization');
    }

    if (member.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Cannot leave as the owner. Transfer ownership first or delete the organization.',
      );
    }

    await this.prisma.organizationMember.delete({
      where: { id: member.id },
    });
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

  // ---- Teams ----

  async getTeams(organizationId: string): Promise<TeamResponseDto[]> {
    const teams = await this.prisma.team.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });

    return teams.map(
      (t) => new TeamResponseDto({ id: t.id, name: t.name, createdAt: t.createdAt }),
    );
  }

  async createTeam(organizationId: string, name: string): Promise<TeamResponseDto> {
    const existing = await this.prisma.team.findUnique({
      where: { organizationId_name: { organizationId, name } },
    });

    if (existing) {
      throw new ConflictException(`A team named "${name}" already exists in this organization`);
    }

    const team = await this.prisma.team.create({
      data: { organizationId, name },
    });

    return new TeamResponseDto({ id: team.id, name: team.name, createdAt: team.createdAt });
  }

  async renameTeam(teamId: string, name: string): Promise<TeamResponseDto> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { name },
    });

    return new TeamResponseDto({ id: updated.id, name: updated.name, createdAt: updated.createdAt });
  }

  async deleteTeam(teamId: string): Promise<void> {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    await this.prisma.$transaction([
      this.prisma.organizationMember.updateMany({
        where: { teamId },
        data: { teamId: null },
      }),
      this.prisma.team.delete({ where: { id: teamId } }),
    ]);
  }

  // ---- Participants ----

  async getParticipants(
    organizationId: string,
    status?: string,
  ): Promise<ParticipantResponseDto[]> {
    const members = await this.prisma.organizationMember.findMany({
      where: {
        organizationId,
        ...(status ? { role: status as OrganizationRole } : {}),
      },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { joinedAt: 'asc' },
    });

    const memberIds = members.map((m) => m.id);
    const completedForms = await this.prisma.form.findMany({
      where: {
        memberId: { in: memberIds },
        status: 'completed',
      },
      select: { memberId: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
    });

    const lastTestMap = new Map<string, Date>();
    for (const f of completedForms) {
      if (f.memberId && !lastTestMap.has(f.memberId)) {
        lastTestMap.set(f.memberId, f.updated_at!);
      }
    }

    return members.map(
      (m) =>
        new ParticipantResponseDto({
          id: m.id,
          email: m.email,
          firstName: m.firstName,
          lastName: m.lastName ?? undefined,
          status: m.role,
          teamId: m.team?.id,
          teamName: m.team?.name,
          createdAt: m.joinedAt,
          lastTestDate: lastTestMap.get(m.id),
        }),
    );
  }

  async updateParticipant(
    organizationId: string,
    participantId: string,
    dto: UpdateParticipantTeamDto,
  ): Promise<ParticipantResponseDto> {
    const member = await this.prisma.organizationMember.findFirst({
      where: { id: participantId, organizationId },
      include: { team: { select: { id: true, name: true } } },
    });

    if (!member) {
      throw new NotFoundException('Participant not found');
    }

    const updateData: any = {};
    if (dto.teamId !== undefined) {
      if (dto.teamId) {
        const team = await this.prisma.team.findFirst({
          where: { id: dto.teamId, organizationId },
        });
        if (!team) {
          throw new NotFoundException('Team not found in this organization');
        }
      }
      updateData.teamId = dto.teamId || null;
    }

    const updated = await this.prisma.organizationMember.update({
      where: { id: member.id },
      data: updateData,
      include: { team: { select: { id: true, name: true } } },
    });

    const completedForm = await this.prisma.form.findFirst({
      where: { memberId: member.id, status: 'completed' },
      orderBy: { updated_at: 'desc' },
      select: { updated_at: true },
    });

    return new ParticipantResponseDto({
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName ?? undefined,
      status: updated.role,
      teamId: updated.team?.id,
      teamName: updated.team?.name,
      createdAt: updated.joinedAt,
      lastTestDate: completedForm?.updated_at ?? undefined,
    });
  }

  async deleteParticipant(participantId: string): Promise<void> {
    const member = await this.prisma.organizationMember.findUnique({
      where: { id: participantId },
    });

    if (!member) {
      throw new NotFoundException('Participant not found');
    }

    await this.prisma.organizationMember.delete({
      where: { id: participantId },
    });
  }

  async getCandidates(organizationId: string): Promise<ParticipantResponseDto[]> {
    return this.getParticipants(organizationId, 'CANDIDATE');
  }

  // ---- Simulation ----

  async simulateTeam(
    organizationId: string,
    teamId: string,
    dto: SimulateTeamDto,
  ): Promise<DashboardResultDto> {
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId },
    });

    if (!team) {
      throw new NotFoundException('Team not found in this organization');
    }

    const candidate = await this.prisma.organizationMember.findFirst({
      where: {
        id: dto.participantId,
        organizationId,
        role: OrganizationRole.CANDIDATE,
      },
    });

    if (!candidate) {
      throw new NotFoundException('CANDIDATE participant not found');
    }

    const candidateForm = await this.prisma.form.findFirst({
      where: { memberId: candidate.id, status: 'completed' },
      include: {
        answers: {
          select: {
            optionValue: true,
            Option: { select: { dimension: true } },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    const teamMembers = await this.prisma.organizationMember.findMany({
      where: {
        teamId,
        organizationId,
        role: OrganizationRole.EMPLOYEE,
      },
    });

    const teamMemberIds = teamMembers.map((m) => m.id);
    const teamForms = await this.prisma.form.findMany({
      where: {
        memberId: { in: teamMemberIds },
        status: 'completed',
      },
      include: {
        member: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        answers: {
          select: {
            optionValue: true,
            Option: { select: { dimension: true } },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    const latestTeamFormMap = new Map<string, typeof teamForms[0]>();
    for (const f of teamForms) {
      if (f.member?.id && !latestTeamFormMap.has(f.member.id)) {
        latestTeamFormMap.set(f.member.id, f);
      }
    }

    const members: MemberResultDto[] = [];
    const totalScores = { D: 0, I: 0, S: 0, C: 0 };
    let membersWithResults = 0;

    for (const tm of teamMembers) {
      const form = latestTeamFormMap.get(tm.id);

      if (!form) {
        members.push(
          new MemberResultDto({
            id: tm.id,
            email: tm.email,
            firstName: tm.firstName,
            lastName: tm.lastName ?? undefined,
            D: 0, I: 0, S: 0, C: 0,
          }),
        );
        continue;
      }

      const scores = { D: 0, I: 0, S: 0, C: 0 };
      for (const answer of form.answers) {
        scores[answer.Option.dimension]++;
      }

      totalScores.D += scores.D;
      totalScores.I += scores.I;
      totalScores.S += scores.S;
      totalScores.C += scores.C;
      membersWithResults++;

      members.push(
        new MemberResultDto({
          id: tm.id,
          email: tm.email,
          firstName: tm.firstName,
          lastName: tm.lastName ?? undefined,
          ...scores,
        }),
      );
    }

    if (candidateForm) {
      const candidateScores = { D: 0, I: 0, S: 0, C: 0 };
      for (const answer of candidateForm.answers) {
        candidateScores[answer.Option.dimension]++;
      }

      totalScores.D += candidateScores.D;
      totalScores.I += candidateScores.I;
      totalScores.S += candidateScores.S;
      totalScores.C += candidateScores.C;
      membersWithResults++;

      members.push(
        new MemberResultDto({
          id: candidate.id,
          email: candidate.email,
          firstName: candidate.firstName,
          lastName: candidate.lastName ?? undefined,
          ...candidateScores,
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
}
