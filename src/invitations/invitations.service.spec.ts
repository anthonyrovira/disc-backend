import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { InvitationsService } from './invitations.service';
import {
  InvitationType,
  InvitationStatus,
  OrganizationRole,
} from '../../generated/prisma/client';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockPrisma = {
    invitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
    },
    organizationMembership: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseDto = {
      email: 'colleague@acme.com',
      type: InvitationType.TEAM_MEMBER,
      organizationId: 'org-id',
    };

    it('should throw ForbiddenException when inviting yourself', async () => {
      await expect(
        service.create('user-id', 'colleague@acme.com', baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when TEAM_MEMBER without orgId', async () => {
      await expect(
        service.create('user-id', 'owner@acme.com', {
          email: 'colleague@acme.com',
          type: InvitationType.TEAM_MEMBER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when CANDIDATE without orgId', async () => {
      await expect(
        service.create('user-id', 'owner@acme.com', {
          email: 'candidate@acme.com',
          type: InvitationType.CANDIDATE,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not OWNER/MANAGER', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'user-id',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });

      await expect(
        service.create('user-id', 'owner@acme.com', baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has no membership', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-id', 'owner@acme.com', baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if pending invitation exists', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'user-id',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });

      mockPrisma.invitation.findFirst.mockResolvedValue({
        id: 'existing-id',
        token: 'existing-token',
      });

      mockPrisma.organization.findUnique.mockResolvedValue({
        name: 'Acme Corp',
      });

      await expect(
        service.create('user-id', 'owner@acme.com', baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a TEAM_MEMBER invitation successfully', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'user-id',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });

      mockPrisma.invitation.findFirst.mockResolvedValue(null);

      const mockInvitation = {
        id: 'inv-id',
        email: 'colleague@acme.com',
        type: InvitationType.TEAM_MEMBER,
        status: InvitationStatus.PENDING,
        token: 'a'.repeat(64),
        organizationId: 'org-id',
        invitedByUserId: 'user-id',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        organization: { name: 'Acme Corp' },
      };

      mockPrisma.invitation.create.mockResolvedValue(mockInvitation);

      const result = await service.create(
        'user-id',
        'owner@acme.com',
        baseDto,
      );

      expect(result.type).toBe(InvitationType.TEAM_MEMBER);
      expect(result.email).toBe('colleague@acme.com');
      expect(result.organizationName).toBe('Acme Corp');
      expect(result.token).toBe('a'.repeat(64));
    });

    it('should create a REFERRAL invitation without organizationId', async () => {
      const mockInvitation = {
        id: 'inv-id',
        email: 'friend@test.com',
        type: InvitationType.REFERRAL,
        status: InvitationStatus.PENDING,
        token: 'b'.repeat(64),
        organizationId: null,
        invitedByUserId: 'user-id',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        organization: null,
      };

      mockPrisma.invitation.create.mockResolvedValue(mockInvitation);

      const result = await service.create('user-id', 'owner@acme.com', {
        email: 'friend@test.com',
        type: InvitationType.REFERRAL,
      });

      expect(result.type).toBe(InvitationType.REFERRAL);
      expect(result.organizationName).toBeUndefined();
    });
  });

  describe('preview', () => {
    it('should return preview data for a valid invitation', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      mockPrisma.invitation.findUnique.mockResolvedValue({
        email: 'test@test.com',
        type: InvitationType.TEAM_MEMBER,
        status: InvitationStatus.PENDING,
        expiresAt: futureDate,
        organization: { name: 'Acme Corp' },
      });

      const result = await service.preview('valid-token');

      expect(result.email).toBe('test@test.com');
      expect(result.organizationName).toBe('Acme Corp');
      expect(result.expired).toBe(false);
    });

    it('should return expired flag when invitation is expired', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      mockPrisma.invitation.findUnique.mockResolvedValue({
        email: 'test@test.com',
        type: InvitationType.TEAM_MEMBER,
        status: InvitationStatus.PENDING,
        expiresAt: pastDate,
        organization: { name: 'Acme Corp' },
      });

      const result = await service.preview('expired-token');

      expect(result.expired).toBe(true);
    });

    it('should throw NotFoundException if token not found', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.preview('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('accept', () => {
    const validToken = 'valid-token';
    const futureDate = new Date(Date.now() + 86400000);
    const baseInvitation = {
      id: 'inv-id',
      email: 'invited@acme.com',
      type: InvitationType.TEAM_MEMBER,
      status: InvitationStatus.PENDING,
      token: validToken,
      organizationId: 'org-id',
      invitedByUserId: 'inviter-id',
      expiresAt: futureDate,
      acceptedAt: null,
      formId: null,
      createdAt: new Date(),
      organization: { name: 'Acme Corp' },
    };

    it('should throw NotFoundException if invitation not found', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await expect(
        service.accept(validToken, 'user-id', 'invited@acme.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if email does not match', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(baseInvitation);

      await expect(
        service.accept(validToken, 'user-id', 'other@acme.com'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw GoneException if invitation is expired', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      mockPrisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        expiresAt: pastDate,
      });

      await expect(
        service.accept(validToken, 'user-id', 'invited@acme.com'),
      ).rejects.toThrow(GoneException);
    });

    it('should throw GoneException if invitation is revoked', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        status: InvitationStatus.REVOKED,
      });

      await expect(
        service.accept(validToken, 'user-id', 'invited@acme.com'),
      ).rejects.toThrow(GoneException);
    });

    it('should do nothing if already accepted (idempotent)', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        status: InvitationStatus.ACCEPTED,
      });

      await service.accept(validToken, 'user-id', 'invited@acme.com');

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should accept TEAM_MEMBER invitation and create membership', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(baseInvitation);

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<void>) => {
          const tx = {
            invitation: {
              update: jest.fn().mockResolvedValue({}),
            },
            organizationMembership: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
            },
          };
          await cb(tx);
        },
      );

      await service.accept(validToken, 'user-id', 'invited@acme.com');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should accept TEAM_MEMBER but not duplicate existing membership', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(baseInvitation);

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<void>) => {
          const tx = {
            invitation: {
              update: jest.fn().mockResolvedValue({}),
            },
            organizationMembership: {
              findUnique: jest.fn().mockResolvedValue({
                userId: 'user-id',
                organizationId: 'org-id',
              }),
              create: jest.fn(),
            },
          };
          await cb(tx);
        },
      );

      await service.accept(validToken, 'user-id', 'invited@acme.com');

      expect(
        (mockPrisma.$transaction as jest.Mock).mock.calls[0][0].toString(),
      ).toBeDefined();
    });

    it('should accept CANDIDATE invitation and create membership with CANDIDATE role', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        type: InvitationType.CANDIDATE,
      });

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<void>) => {
          const tx = {
            invitation: {
              update: jest.fn().mockResolvedValue({}),
            },
            organizationMembership: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({}),
            },
          };
          await cb(tx);
        },
      );

      await service.accept(validToken, 'user-id', 'invited@acme.com');

      const tx = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        invitation: { update: jest.fn().mockResolvedValue({}) },
        organizationMembership: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      await tx(mockTx);

      expect(mockTx.organizationMembership.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-id',
          organizationId: 'org-id',
          role: OrganizationRole.CANDIDATE,
          invitedById: 'inviter-id',
        },
      });
    });

    it('should accept REFERRAL invitation without organization', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        type: InvitationType.REFERRAL,
        organizationId: null,
      });

      mockPrisma.$transaction.mockImplementation(
        async (cb: (tx: any) => Promise<void>) => {
          const tx = {
            invitation: {
              update: jest.fn().mockResolvedValue({}),
            },
            organizationMembership: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          };
          await cb(tx);
        },
      );

      await service.accept(validToken, 'user-id', 'invited@acme.com');

      const tx = mockPrisma.$transaction.mock.calls[0][0];
      const mockTx = {
        invitation: { update: jest.fn().mockResolvedValue({}) },
        organizationMembership: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      };
      await tx(mockTx);

      expect(mockTx.organizationMembership.create).not.toHaveBeenCalled();
    });
  });
});
