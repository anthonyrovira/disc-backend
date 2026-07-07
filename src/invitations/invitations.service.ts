import {
  ConflictException,
  ForbiddenException,
  GoneException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import {
  InvitationTargetStatus,
  InvitationStatus,
  OrganizationRole,
} from '../../generated/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from '@/email';
import {
  CreateInvitationDto,
  InvitationResponseDto,
  InvitationPreviewDto,
  AcceptInvitationResponseDto,
  SetupPasswordResponseDto,
} from './dto/invitations.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    userId: string,
    userEmail: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    if (dto.email.toLowerCase() === userEmail.toLowerCase()) {
      throw new ForbiddenException('You cannot invite yourself');
    }

    return this.createOrgInvitation(userId, dto);
  }

  async createPromotionInvitation(
    userId: string,
    memberId: string,
    data: {
      email: string;
      firstName: string;
      lastName?: string;
      organizationId: string;
      teamId?: string;
    },
  ): Promise<void> {
    const existing = await this.prisma.invitation.findFirst({
      where: {
        email: data.email.toLowerCase(),
        organizationId: data.organizationId,
        status: InvitationStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      throw new ConflictException(
        `A pending invitation already exists for ${data.email}`,
      );
    }

    const dto = new CreateInvitationDto();
    dto.email = data.email;
    dto.firstName = data.firstName;
    dto.lastName = data.lastName;
    dto.targetStatus = InvitationTargetStatus.MANAGER;
    dto.organizationId = data.organizationId;
    dto.teamId = data.teamId;
    dto.memberId = memberId;

    await this.createInvitationRecord(userId, dto);
  }

  private async createOrgInvitation(
    userId: string,
    dto: CreateInvitationDto,
  ): Promise<InvitationResponseDto> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: dto.organizationId,
        },
      },
    });

    if (
      !member ||
      (member.role !== OrganizationRole.OWNER &&
        member.role !== OrganizationRole.MANAGER)
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

    if (dto.teamId) {
      const team = await this.prisma.team.findFirst({
        where: { id: dto.teamId, organizationId: dto.organizationId },
      });
      if (!team) {
        throw new NotFoundException('Team not found in this organization');
      }
    }

    return this.createInvitationRecord(userId, dto);
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
        firstName: dto.firstName,
        lastName: dto.lastName ?? null,
        targetStatus: dto.targetStatus,
        status: InvitationStatus.PENDING,
        token,
        organizationId: dto.organizationId,
        teamId: dto.teamId ?? null,
        invitedByUserId: userId,
        memberId: dto.memberId ?? null,
        expiresAt,
      },
      include: {
        organization: { select: { name: true } },
        team: { select: { name: true } },
      },
    });

    const response = new InvitationResponseDto({
      id: invitation.id,
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName ?? undefined,
      targetStatus: invitation.targetStatus as InvitationTargetStatus,
      status: invitation.status as InvitationStatus,
      token: invitation.token,
      organizationName: invitation.organization.name,
      teamName: invitation.team?.name,
      invitedByUserId: invitation.invitedByUserId,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
    });

    await this.sendInvitationEmail(userId, invitation, token);

    return response;
  }

  private async sendInvitationEmail(
    userId: string,
    invitation: {
      email: string;
      firstName: string;
      targetStatus: InvitationTargetStatus;
      organization?: { name: string } | null;
      team?: { name: string } | null;
    },
    token: string,
  ): Promise<void> {
    try {
      const inviter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });

      if (!inviter) {
        this.logger.warn(`Inviter not found for user ${userId}, skipping email`);
        return;
      }

      const inviterName = inviter.lastName
        ? `${inviter.firstName} ${inviter.lastName}`
        : inviter.firstName;

      const orgName = invitation.organization?.name ?? 'une organisation';
      const invitationUrl = `${this.emailService.appUrl}/invitations/${token}`;

      const templateConfigs: Record<
        InvitationTargetStatus,
        { template: string; subject: string } | undefined
      > = {
        [InvitationTargetStatus.CANDIDATE]: {
          template: 'candidate-invitation',
          subject: `Test DISC — ${orgName} vous sollicite`,
        },
        [InvitationTargetStatus.EMPLOYEE]: {
          template: 'team-member-invitation',
          subject: `${inviterName} vous invite à rejoindre ${orgName} sur DISC.dev`,
        },
        [InvitationTargetStatus.MANAGER]: {
          template: 'team-member-invitation',
          subject: `${inviterName} vous invite à gérer ${orgName} sur DISC.dev`,
        },
      };

      const config = templateConfigs[invitation.targetStatus];

      if (!config) {
        this.logger.warn(`No email template for invitation target status ${invitation.targetStatus}`);
        return;
      }

      await this.emailService.send({
        to: invitation.email,
        subject: config.subject,
        template: config.template,
        data: {
          inviterName,
          organizationName: orgName,
          invitationUrl,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to send invitation email to ${invitation.email}`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  async getUserInvitations(userId: string): Promise<InvitationResponseDto[]> {
    const invitations = await this.prisma.invitation.findMany({
      where: { invitedByUserId: userId },
      include: {
        organization: { select: { name: true } },
        team: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations.map(
      (inv) =>
        new InvitationResponseDto({
          id: inv.id,
          email: inv.email,
          firstName: inv.firstName,
          lastName: inv.lastName ?? undefined,
          targetStatus: inv.targetStatus as InvitationTargetStatus,
          status: inv.status as InvitationStatus,
          token: inv.token,
          organizationName: inv.organization.name,
          teamName: inv.team?.name,
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
        team: { select: { name: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const expired = invitation.expiresAt < new Date();

    return new InvitationPreviewDto({
      email: invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName ?? undefined,
      targetStatus: invitation.targetStatus as InvitationTargetStatus,
      organizationName: invitation.organization.name,
      teamName: invitation.team?.name,
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

  private async validateInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { name: true } },
        team: { select: { name: true } },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
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
      throw new ConflictException('This invitation has already been accepted');
    }

    return invitation;
  }

  async accept(token: string): Promise<AcceptInvitationResponseDto> {
    const invitation = await this.validateInvitation(token);

    const targetStatus = invitation.targetStatus as InvitationTargetStatus;

    if (targetStatus === InvitationTargetStatus.MANAGER) {
      return new AcceptInvitationResponseDto({
        token,
        targetStatus: InvitationTargetStatus.MANAGER,
      });
    }

    const isCandidate = targetStatus === InvitationTargetStatus.CANDIDATE;

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      const member = await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          teamId: invitation.teamId,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          role: isCandidate ? OrganizationRole.CANDIDATE : OrganizationRole.EMPLOYEE,
          invitedById: invitation.invitedByUserId,
        },
      });

      const form = await tx.form.create({
        data: {
          name: 'disc_form',
          memberId: member.id,
          status: 'in_progress',
          created_at: new Date(),
        },
      });

      const allQuestions = await tx.question.findMany({
        select: { id: true },
      });

      const shuffled = this.shuffle(allQuestions.map((q) => q.id)).slice(0, 30);

      await tx.formQuestion.createMany({
        data: shuffled.map((questionId, index) => ({
          formId: form.id,
          questionId,
          order: index + 1,
        })),
      });

      const generatedName = this.generateFormName();
      await tx.form.update({
        where: { id: form.id },
        data: { name: generatedName },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { formId: form.id },
      });

      return form.id;
    });

    const redirectUrl = `${this.emailService.appUrl}/form/${result}`;

    await this.notifyInviterOnAccept(invitation, invitation.email);

    return new AcceptInvitationResponseDto({
      token,
      targetStatus: InvitationTargetStatus.CANDIDATE,
      formId: result,
      redirectUrl,
    });
  }

  async setupPassword(
    token: string,
    password: string,
  ): Promise<SetupPasswordResponseDto> {
    const invitation = await this.validateInvitation(token);

    if (invitation.targetStatus !== InvitationTargetStatus.MANAGER) {
      throw new ForbiddenException(
        'Password setup is only available for MANAGER invitations',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email already exists',
      );
    }

    const hash = await argon2.hash(password);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          hash,
        },
      });

      let formId: string;

      if (invitation.memberId) {
        // Promotion flow: update existing member to MANAGER, keep existing form
        await tx.organizationMember.update({
          where: { id: invitation.memberId },
          data: {
            role: OrganizationRole.MANAGER,
            userId: user.id,
          },
        });

        const existingForm = await tx.form.findFirst({
          where: { memberId: invitation.memberId },
          orderBy: { created_at: 'desc' },
        });

        if (existingForm) {
          await tx.invitation.update({
            where: { id: invitation.id },
            data: {
              status: InvitationStatus.ACCEPTED,
              acceptedAt: new Date(),
              formId: existingForm.id,
            },
          });
          formId = existingForm.id;
        } else {
          formId = await this.createFormForMember(tx, invitation.memberId, invitation.id);
        }
      } else {
        // Standard flow: create new member + new form
        const member = await tx.organizationMember.create({
          data: {
            userId: user.id,
            email: invitation.email,
            firstName: invitation.firstName,
            lastName: invitation.lastName,
            organizationId: invitation.organizationId,
            teamId: invitation.teamId,
            role: OrganizationRole.MANAGER,
            invitedById: invitation.invitedByUserId,
          },
        });

        formId = await this.createFormForMember(tx, member.id, invitation.id);
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return { accessToken, formId };
    });

    return new SetupPasswordResponseDto({
      accessToken: result.accessToken,
      formId: result.formId,
    });
  }

  private async notifyInviterOnAccept(
    invitation: {
      invitedByUserId: string;
      organization?: { name: string } | null;
    },
    acceptedUserEmail: string,
  ): Promise<void> {
    try {
      const inviter = await this.prisma.user.findUnique({
        where: { id: invitation.invitedByUserId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (!inviter) {
        this.logger.warn(
          `Inviter ${invitation.invitedByUserId} not found, skipping notification`,
        );
        return;
      }

      const orgName = invitation.organization?.name ?? 'une organisation';
      const teamUrl = `${this.emailService.appUrl}/organizations/${invitation.invitedByUserId}`;

      await this.emailService.send({
        to: inviter.email,
        subject: `${acceptedUserEmail} a rejoint ${orgName}`,
        template: 'invitation-accepted',
        data: {
          managerName: inviter.lastName
            ? `${inviter.firstName} ${inviter.lastName}`
            : inviter.firstName,
          invitedUserEmail: acceptedUserEmail,
          organizationName: orgName,
          teamUrl,
        },
      });
    } catch (err) {
      this.logger.error(
        `Failed to send acceptance notification to inviter`,
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  private async createFormForMember(
    tx: any,
    memberId: string,
    invitationId: string,
  ): Promise<string> {
    const form = await tx.form.create({
      data: {
        name: 'disc_form',
        memberId,
        status: 'in_progress',
        created_at: new Date(),
      },
    });

    const allQuestions = await tx.question.findMany({
      select: { id: true },
    });

    const shuffled = this.shuffle(allQuestions.map((q) => q.id)).slice(0, 30);

    await tx.formQuestion.createMany({
      data: shuffled.map((questionId, index) => ({
        formId: form.id,
        questionId,
        order: index + 1,
      })),
    });

    const generatedName = this.generateFormName();
    await tx.form.update({
      where: { id: form.id },
      data: { name: generatedName },
    });

    await tx.invitation.update({
      where: { id: invitationId },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
        formId: form.id,
      },
    });

    return form.id;
  }

  private generateFormName(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `Test DISC - ${day}/${month}/${year}`;
  }

  private shuffle(array: string[]): string[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
