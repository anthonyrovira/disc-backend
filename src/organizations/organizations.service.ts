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
  ParticipantStatus,
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

    const orgIds = memberships.map((m) => m.organization.id);

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

    return memberships.map(
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
          select: { user_id: true, participantId: true, updated_at: true, status: true },
        },
      },
      orderBy: { form: { updated_at: 'desc' } },
    });

    const userLastTestMap = new Map<string, Date>();
    const participantLastTestMap = new Map<string, Date>();
    for (const link of formLinks) {
      if (link.form.status !== 'completed') continue;
      if (link.form.user_id && !userLastTestMap.has(link.form.user_id)) {
        userLastTestMap.set(link.form.user_id, link.form.updated_at!);
      }
      if (link.form.participantId && !participantLastTestMap.has(link.form.participantId)) {
        participantLastTestMap.set(link.form.participantId, link.form.updated_at!);
      }
    }

    const members: MemberDto[] = [];

    const memberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        team: { select: { id: true, name: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    for (const m of memberships) {
      members.push(
        new MemberDto({
          id: m.userId,
          email: m.user.email,
          firstName: m.user.firstName ?? undefined,
          lastName: m.user.lastName ?? undefined,
          role: m.role,
          teamId: m.team?.id,
          teamName: m.team?.name,
          joinedAt: m.joinedAt,
          lastTestDate: userLastTestMap.get(m.userId),
        }),
      );
    }

    const participants = await this.prisma.participant.findMany({
      where: { organizationId, status: ParticipantStatus.EMPLOYEE },
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    for (const p of participants) {
      members.push(
        new MemberDto({
          id: p.id,
          email: p.email,
          firstName: p.firstName ?? undefined,
          lastName: p.lastName ?? undefined,
          role: ParticipantStatus.EMPLOYEE,
          teamId: p.team?.id,
          teamName: p.team?.name,
          joinedAt: p.createdAt,
          lastTestDate: participantLastTestMap.get(p.id),
        }),
      );
    }

    return members;
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
    teamId?: string,
  ): Promise<DashboardResultDto> {
    const formLinks = await this.prisma.formOrganization.findMany({
      where: { organizationId },
      include: {
        form: {
          include: {
            User: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
            Participant: {
              select: { id: true, email: true, firstName: true, lastName: true, status: true, teamId: true, team: { select: { name: true } } },
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

    const userLatestForm = new Map<string, typeof formLinks[0]['form']>();
    const participantLatestForm = new Map<string, typeof formLinks[0]['form']>();

    for (const link of formLinks) {
      if (link.form.status !== 'completed') continue;

      if (link.form.User?.id) {
        const uid = link.form.User.id;
        if (!userLatestForm.has(uid)) {
          userLatestForm.set(uid, link.form);
        }
      }

      if (link.form.Participant?.id) {
        const pid = link.form.Participant.id;
        if (!participantLatestForm.has(pid)) {
          participantLatestForm.set(pid, link.form);
        }
      }
    }

    const members: MemberResultDto[] = [];
    const totalScores = { D: 0, I: 0, S: 0, C: 0 };
    let membersWithResults = 0;

    const allMemberships = await this.prisma.organizationMembership.findMany({
      where: { organizationId, ...(teamId ? { teamId } : {}) },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    for (const membership of allMemberships) {
      const form = userLatestForm.get(membership.user.id);

      if (!form) {
        members.push(
          new MemberResultDto({
            id: membership.user.id,
            email: membership.user.email,
            firstName: membership.user.firstName ?? undefined,
            lastName: membership.user.lastName ?? undefined,
            D: 0,
            I: 0,
            S: 0,
            C: 0,
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
          id: membership.user.id,
          email: membership.user.email,
          firstName: membership.user.firstName ?? undefined,
          lastName: membership.user.lastName ?? undefined,
          ...scores,
        }),
      );
    }

    const allParticipants = await this.prisma.participant.findMany({
      where: {
        organizationId,
        status: ParticipantStatus.EMPLOYEE,
        ...(teamId ? { teamId } : {}),
      },
    });

    for (const participant of allParticipants) {
      const form = participantLatestForm.get(participant.id);

      if (!form) {
        members.push(
          new MemberResultDto({
            id: participant.id,
            email: participant.email,
            firstName: participant.firstName ?? undefined,
            lastName: participant.lastName ?? undefined,
            D: 0,
            I: 0,
            S: 0,
            C: 0,
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
          id: participant.id,
          email: participant.email,
          firstName: participant.firstName ?? undefined,
          lastName: participant.lastName ?? undefined,
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

  async leaveOrganization(
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const membership = await this.prisma.organizationMembership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this organization');
    }

    if (membership.role === OrganizationRole.OWNER) {
      throw new ForbiddenException(
        'Cannot leave as the owner. Transfer ownership first or delete the organization.',
      );
    }

    await this.prisma.organizationMembership.delete({
      where: { userId_organizationId: { userId, organizationId } },
    });

    // TODO: notify managers (OWNER + MANAGER) that a member has left the org
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
      this.prisma.organizationMembership.updateMany({
        where: { teamId },
        data: { teamId: null },
      }),
      this.prisma.participant.updateMany({
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
    const where: any = { organizationId };
    if (status) {
      where.status = status;
    }

    const participants = await this.prisma.participant.findMany({
      where,
      include: { team: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const participantIds = participants.map((p) => p.id);
    const completedForms = await this.prisma.form.findMany({
      where: {
        participantId: { in: participantIds },
        status: 'completed',
      },
      select: { participantId: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
    });

    const lastTestMap = new Map<string, Date>();
    for (const f of completedForms) {
      if (f.participantId && !lastTestMap.has(f.participantId)) {
        lastTestMap.set(f.participantId, f.updated_at!);
      }
    }

    return participants.map(
      (p) =>
        new ParticipantResponseDto({
          id: p.id,
          email: p.email,
          firstName: p.firstName,
          lastName: p.lastName ?? undefined,
          status: p.status,
          teamId: p.team?.id,
          teamName: p.team?.name,
          createdAt: p.createdAt,
          lastTestDate: lastTestMap.get(p.id),
        }),
    );
  }

  async updateParticipant(
    organizationId: string,
    participantId: string,
    dto: UpdateParticipantTeamDto,
  ): Promise<ParticipantResponseDto> {
    const participant = await this.prisma.participant.findFirst({
      where: { id: participantId, organizationId },
      include: { team: { select: { id: true, name: true } } },
    });

    if (!participant) {
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

    const updated = await this.prisma.participant.update({
      where: { id: participantId },
      data: updateData,
      include: { team: { select: { id: true, name: true } } },
    });

    const completedForm = await this.prisma.form.findFirst({
      where: { participantId, status: 'completed' },
      orderBy: { updated_at: 'desc' },
      select: { updated_at: true },
    });

    return new ParticipantResponseDto({
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName ?? undefined,
      status: updated.status,
      teamId: updated.team?.id,
      teamName: updated.team?.name,
      createdAt: updated.createdAt,
      lastTestDate: completedForm?.updated_at ?? undefined,
    });
  }

  async deleteParticipant(participantId: string): Promise<void> {
    const participant = await this.prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    await this.prisma.participant.delete({
      where: { id: participantId },
    });
  }

  async getCandidates(organizationId: string): Promise<ParticipantResponseDto[]> {
    return this.getParticipants(organizationId, ParticipantStatus.CANDIDATE);
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

    const candidate = await this.prisma.participant.findFirst({
      where: { id: dto.participantId, organizationId, status: ParticipantStatus.CANDIDATE },
    });

    if (!candidate) {
      throw new NotFoundException('CANDIDATE participant not found');
    }

    const candidateForm = await this.prisma.form.findFirst({
      where: { participantId: candidate.id, status: 'completed' },
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

    const teamMembers = await this.prisma.participant.findMany({
      where: { teamId, organizationId, status: ParticipantStatus.EMPLOYEE },
    });

    const teamParticipantIds = teamMembers.map((m) => m.id);
    const teamForms = await this.prisma.form.findMany({
      where: {
        participantId: { in: teamParticipantIds },
        status: 'completed',
      },
      include: {
        Participant: {
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
      if (f.Participant?.id && !latestTeamFormMap.has(f.Participant.id)) {
        latestTeamFormMap.set(f.Participant.id, f);
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
