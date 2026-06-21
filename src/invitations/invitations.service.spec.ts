import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';
import { EmailService } from '@/email';
import { InvitationsService } from './invitations.service';
import {
  InvitationTargetStatus,
  InvitationStatus,
  OrganizationRole,
} from '../../generated/prisma/client';

describe('InvitationsService', () => {
  let service: InvitationsService;

  const mockEmailService = {
    send: jest.fn(),
    appUrl: 'http://localhost:5173',
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  let prisma: any;

  const mockPrisma = () => ({
    user: { findUnique: jest.fn() },
    invitation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    organization: { findUnique: jest.fn() },
    organizationMembership: { findUnique: jest.fn() },
    participant: { create: jest.fn() },
    team: { findFirst: jest.fn() },
    form: { create: jest.fn(), update: jest.fn() },
    formQuestion: { createMany: jest.fn() },
    question: { findMany: jest.fn() },
    $transaction: jest.fn(),
  });

  beforeEach(async () => {
    prisma = mockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const baseDto = {
      email: 'colleague@acme.com',
      firstName: 'John',
      lastName: 'Doe',
      targetStatus: InvitationTargetStatus.EMPLOYEE,
      organizationId: 'org-id',
    };

    it('should throw ForbiddenException when inviting yourself', async () => {
      await expect(
        service.create('user-id', 'colleague@acme.com', baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is not OWNER/MANAGER', async () => {
      prisma.organizationMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-id', 'owner@acme.com', baseDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if pending invitation exists', async () => {
      prisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'user-id',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });
      prisma.invitation.findFirst.mockResolvedValue({ id: 'existing-id' });
      prisma.organization.findUnique.mockResolvedValue({
        name: 'Acme Corp',
      });

      await expect(
        service.create('user-id', 'owner@acme.com', baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should create an invitation successfully', async () => {
      prisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'user-id',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });
      prisma.invitation.findFirst.mockResolvedValue(null);
      prisma.invitation.create.mockResolvedValue({
        id: 'inv-id',
        email: 'colleague@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        targetStatus: InvitationTargetStatus.EMPLOYEE,
        status: InvitationStatus.PENDING,
        token: 'a'.repeat(64),
        organizationId: 'org-id',
        teamId: null,
        invitedByUserId: 'user-id',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        organization: { name: 'Acme Corp' },
        team: null,
      });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
      });

      const result = await service.create('user-id', 'owner@acme.com', baseDto);

      expect(result.targetStatus).toBe(InvitationTargetStatus.EMPLOYEE);
      expect(result.email).toBe('colleague@acme.com');
      expect(result.organizationName).toBe('Acme Corp');
    });
  });

  describe('preview', () => {
    it('should return preview data for a valid invitation', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      prisma.invitation.findUnique.mockResolvedValue({
        email: 'test@test.com',
        firstName: 'John',
        lastName: null,
        targetStatus: InvitationTargetStatus.EMPLOYEE,
        status: InvitationStatus.PENDING,
        expiresAt: futureDate,
        organization: { name: 'Acme Corp' },
        team: null,
      });

      const result = await service.preview('valid-token');

      expect(result.email).toBe('test@test.com');
      expect(result.organizationName).toBe('Acme Corp');
      expect(result.expired).toBe(false);
    });

    it('should throw NotFoundException if token not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);
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
      firstName: 'John',
      lastName: 'Doe',
      targetStatus: InvitationTargetStatus.EMPLOYEE,
      status: InvitationStatus.PENDING,
      token: validToken,
      organizationId: 'org-id',
      teamId: null,
      invitedByUserId: 'inviter-id',
      expiresAt: futureDate,
      acceptedAt: null,
      formId: null,
      createdAt: new Date(),
      organization: { name: 'Acme Corp' },
      team: null,
    };

    it('should throw NotFoundException if invitation not found', async () => {
      prisma.invitation.findUnique.mockResolvedValue(null);

      await expect(service.accept(validToken)).rejects.toThrow(NotFoundException);
    });

    it('should throw GoneException if invitation is expired', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      prisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        expiresAt: pastDate,
      });

      await expect(service.accept(validToken)).rejects.toThrow(GoneException);
    });

    it('should throw GoneException if invitation is revoked', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        status: InvitationStatus.REVOKED,
      });

      await expect(service.accept(validToken)).rejects.toThrow(GoneException);
    });

    it('should return MANAGER response without creating entities', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        targetStatus: InvitationTargetStatus.MANAGER,
      });

      const result = await service.accept(validToken);

      expect(result.targetStatus).toBe(InvitationTargetStatus.MANAGER);
      expect(result.token).toBe(validToken);
      expect(result.formId).toBeUndefined();
    });

    it('should create Participant + Form for EMPLOYEE invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue(baseInvitation);

      const mockTx = {
        invitation: { update: jest.fn().mockResolvedValue({}) },
        participant: { create: jest.fn().mockResolvedValue({ id: 'p-id' }) },
        form: {
          create: jest.fn().mockResolvedValue({ id: 'f-id' }),
          update: jest.fn().mockResolvedValue({}),
        },
        question: { findMany: jest.fn().mockResolvedValue([{ id: 'q1' }, { id: 'q2' }]) },
        formQuestion: { createMany: jest.fn() },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.accept(validToken);

      expect(mockTx.participant.create).toHaveBeenCalled();
      expect(mockTx.form.create).toHaveBeenCalled();
      expect(result.formId).toBe('f-id');
      expect(result.redirectUrl).toContain('http://localhost:5173/form/');
    });

    it('should create CANDIDATE participant for CANDIDATE invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        targetStatus: InvitationTargetStatus.CANDIDATE,
      });

      const mockTx = {
        invitation: { update: jest.fn().mockResolvedValue({}) },
        participant: { create: jest.fn().mockResolvedValue({ id: 'p-id' }) },
        form: {
          create: jest.fn().mockResolvedValue({ id: 'f-id' }),
          update: jest.fn().mockResolvedValue({}),
        },
        question: { findMany: jest.fn().mockResolvedValue([{ id: 'q1' }]) },
        formQuestion: { createMany: jest.fn() },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      await service.accept(validToken);

      expect(mockTx.participant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANDIDATE',
          }),
        }),
      );
    });
  });

  describe('setupPassword', () => {
    const validToken = 'valid-token';
    const futureDate = new Date(Date.now() + 86400000);
    const baseInvitation = {
      id: 'inv-id',
      email: 'manager@acme.com',
      firstName: 'Jane',
      lastName: 'Smith',
      targetStatus: InvitationTargetStatus.MANAGER,
      status: InvitationStatus.PENDING,
      token: validToken,
      organizationId: 'org-id',
      teamId: null,
      invitedByUserId: 'inviter-id',
      expiresAt: futureDate,
      acceptedAt: null,
      formId: null,
      createdAt: new Date(),
      organization: { name: 'Acme Corp' },
      team: null,
    };

    it('should throw ForbiddenException if not a MANAGER invitation', async () => {
      prisma.invitation.findUnique.mockResolvedValue({
        ...baseInvitation,
        targetStatus: InvitationTargetStatus.EMPLOYEE,
      });

      await expect(
        service.setupPassword(validToken, 'password123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if user already exists', async () => {
      prisma.invitation.findUnique.mockResolvedValue(baseInvitation);
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.setupPassword(validToken, 'password123'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create User + OrgMembership + Form and return JWT', async () => {
      prisma.invitation.findUnique.mockResolvedValue(baseInvitation);
      prisma.user.findUnique.mockResolvedValue(null);

      const mockTx = {
        user: { create: jest.fn().mockResolvedValue({ id: 'u-id', email: 'manager@acme.com' }) },
        organizationMembership: { create: jest.fn().mockResolvedValue({}) },
        form: {
          create: jest.fn().mockResolvedValue({ id: 'f-id' }),
          update: jest.fn().mockResolvedValue({}),
        },
        question: { findMany: jest.fn().mockResolvedValue([{ id: 'q1' }]) },
        formQuestion: { createMany: jest.fn() },
        invitation: { update: jest.fn().mockResolvedValue({}) },
      };

      prisma.$transaction.mockImplementation(async (cb: any) => cb(mockTx));

      const result = await service.setupPassword(validToken, 'password123');

      expect(mockTx.user.create).toHaveBeenCalled();
      expect(mockTx.organizationMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: OrganizationRole.MANAGER,
          }),
        }),
      );
      expect(result.accessToken).toBe('mock-token');
      expect(result.formId).toBe('f-id');
    });
  });
});
