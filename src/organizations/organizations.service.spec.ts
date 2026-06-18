import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { OrganizationsService } from './organizations.service';
import {
  OrganizationRole,
  OwnershipTransferStatus,
} from '../../generated/prisma/client';

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  const mockPrisma = {
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    organizationMembership: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ownershipTransfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    formOrganization: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization with the user as OWNER', async () => {
      const mockOrg = { id: 'org-id', name: 'Acme', createdAt: new Date() };

      mockPrisma.organization.create.mockResolvedValue(mockOrg);

      const result = await service.create('user-id', { name: 'Acme' });

      expect(result.id).toBe('org-id');
      expect(result.name).toBe('Acme');
      expect(mockPrisma.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'Acme',
          members: {
            create: {
              userId: 'user-id',
              role: OrganizationRole.OWNER,
            },
          },
        },
      });
    });
  });

  describe('findById', () => {
    it('should return the organization if found', async () => {
      const mockOrg = { id: 'org-id', name: 'Acme', createdAt: new Date() };

      mockPrisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.findById('org-id');

      expect(result.id).toBe('org-id');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(service.findById('org-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMembers', () => {
    it('should return members list', async () => {
      const mockMemberships = [
        {
          userId: 'u1',
          organizationId: 'org-id',
          role: OrganizationRole.OWNER,
          joinedAt: new Date(),
          user: { id: 'u1', email: 'owner@test.com', username: 'Owner' },
        },
        {
          userId: 'u2',
          organizationId: 'org-id',
          role: OrganizationRole.MEMBER,
          joinedAt: new Date(),
          user: { id: 'u2', email: 'member@test.com', username: null },
        },
      ];

      mockPrisma.organizationMembership.findMany.mockResolvedValue(
        mockMemberships,
      );

      const result = await service.getMembers('org-id');

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe(OrganizationRole.OWNER);
      expect(result[1].email).toBe('member@test.com');
    });
  });

  describe('getMembership', () => {
    it('should return membership if exists', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u1',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });

      const result = await service.getMembership('u1', 'org-id');

      expect(result.role).toBe(OrganizationRole.MEMBER);
    });

    it('should return null if no membership', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue(null);

      const result = await service.getMembership('u1', 'org-id');

      expect(result).toBeNull();
    });
  });

  describe('updateMemberRole', () => {
    it('should update the role of a non-OWNER member', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u2',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });

      await service.updateMemberRole('org-id', 'u2', OrganizationRole.MANAGER);

      expect(mockPrisma.organizationMembership.update).toHaveBeenCalledWith({
        where: {
          userId_organizationId: { userId: 'u2', organizationId: 'org-id' },
        },
        data: { role: OrganizationRole.MANAGER },
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('org-id', 'u2', OrganizationRole.MANAGER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if target is OWNER', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u1',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });

      await expect(
        service.updateMemberRole('org-id', 'u1', OrganizationRole.MANAGER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if trying to promote to OWNER', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u2',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });

      await expect(
        service.updateMemberRole('org-id', 'u2', OrganizationRole.OWNER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeMember', () => {
    it('should remove a non-OWNER member', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u2',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });

      await service.removeMember('org-id', 'u2');

      expect(mockPrisma.organizationMembership.delete).toHaveBeenCalledWith({
        where: {
          userId_organizationId: { userId: 'u2', organizationId: 'org-id' },
        },
      });
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('org-id', 'u2')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if target is OWNER', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'u1',
        organizationId: 'org-id',
        role: OrganizationRole.OWNER,
      });

      await expect(service.removeMember('org-id', 'u1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getDashboardResults', () => {
    it('should compute average scores from completed forms', async () => {
      const mockFormLinks = [
        {
          form: {
            updated_at: new Date(),
            User: { id: 'u1', email: 'member1@test.com', username: 'Member1' },
            answers: [
              { optionValue: 'q0_D', Option: { dimension: 'D' } },
              { optionValue: 'q1_I', Option: { dimension: 'I' } },
              { optionValue: 'q2_D', Option: { dimension: 'D' } },
              { optionValue: 'q3_S', Option: { dimension: 'S' } },
            ],
          },
        },
        {
          form: {
            updated_at: new Date(),
            User: { id: 'u2', email: 'member2@test.com', username: null },
            answers: [
              { optionValue: 'q0_C', Option: { dimension: 'C' } },
              { optionValue: 'q1_C', Option: { dimension: 'C' } },
              { optionValue: 'q2_I', Option: { dimension: 'I' } },
              { optionValue: 'q3_D', Option: { dimension: 'D' } },
            ],
          },
        },
      ];

      const mockMemberships = [
        {
          userId: 'u1',
          user: { id: 'u1', email: 'member1@test.com', username: 'Member1' },
        },
        {
          userId: 'u2',
          user: { id: 'u2', email: 'member2@test.com', username: null },
        },
      ];

      mockPrisma.formOrganization.findMany.mockResolvedValue(mockFormLinks);
      mockPrisma.organizationMembership.findMany.mockResolvedValue(mockMemberships);

      const result = await service.getDashboardResults('org-id');

      expect(result.total).toBe(2);
      expect(result.averageScores.D).toBe(1.5);
      expect(result.averageScores.I).toBe(1);
      expect(result.averageScores.S).toBe(0.5);
      expect(result.averageScores.C).toBe(1);
      expect(result.members).toHaveLength(2);
    });

    it('should return zero averages when no members have completed forms', async () => {
      const mockMemberships = [
        {
          userId: 'u1',
          user: { id: 'u1', email: 'member1@test.com', username: null },
        },
      ];

      mockPrisma.formOrganization.findMany.mockResolvedValue([]);
      mockPrisma.organizationMembership.findMany.mockResolvedValue(mockMemberships);

      const result = await service.getDashboardResults('org-id');

      expect(result.total).toBe(0);
      expect(result.averageScores.D).toBe(0);
      expect(result.members).toHaveLength(1);
    });
  });

  describe('initiateTransfer', () => {
    it('should create a pending transfer', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'target-id',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue(null);
      mockPrisma.ownershipTransfer.create.mockResolvedValue({ id: 'transfer-id' });

      await service.initiateTransfer('org-id', 'owner-id', 'target-id');

      expect(mockPrisma.ownershipTransfer.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-id',
          fromUserId: 'owner-id',
          toUserId: 'target-id',
          status: OwnershipTransferStatus.PENDING,
        },
      });
    });

    it('should throw BadRequestException if target is self', async () => {
      await expect(
        service.initiateTransfer('org-id', 'owner-id', 'owner-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if target is not a member', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.initiateTransfer('org-id', 'owner-id', 'target-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if a transfer is already pending', async () => {
      mockPrisma.organizationMembership.findUnique.mockResolvedValue({
        userId: 'target-id',
        organizationId: 'org-id',
        role: OrganizationRole.MEMBER,
      });
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue({
        id: 'existing-transfer',
      });

      await expect(
        service.initiateTransfer('org-id', 'owner-id', 'target-id'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('cancelTransfer', () => {
    it('should cancel a pending transfer', async () => {
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue({
        id: 'transfer-id',
        organizationId: 'org-id',
        fromUserId: 'owner-id',
        toUserId: 'target-id',
        status: OwnershipTransferStatus.PENDING,
      });

      await service.cancelTransfer('org-id', 'owner-id');

      expect(mockPrisma.ownershipTransfer.update).toHaveBeenCalledWith({
        where: { id: 'transfer-id' },
        data: { status: OwnershipTransferStatus.CANCELLED },
      });
    });

    it('should throw NotFoundException if no pending transfer', async () => {
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelTransfer('org-id', 'owner-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the initiator', async () => {
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue({
        id: 'transfer-id',
        fromUserId: 'owner-id',
      });

      await expect(
        service.cancelTransfer('org-id', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('acceptOwnership', () => {
    it('should swap roles and update transfer status', async () => {
      const mockTransfer = {
        id: 'transfer-id',
        organizationId: 'org-id',
        fromUserId: 'old-owner',
        toUserId: 'new-owner',
        status: OwnershipTransferStatus.PENDING,
      };

      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue(mockTransfer);

      mockPrisma.$transaction.mockImplementation(
        (input: any) => Promise.resolve(Array.isArray(input) ? input : input({})),
      );

      await service.acceptOwnership('org-id', 'new-owner');

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException if no pending transfer', async () => {
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptOwnership('org-id', 'new-owner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the designated recipient', async () => {
      mockPrisma.ownershipTransfer.findUnique.mockResolvedValue({
        id: 'transfer-id',
        toUserId: 'designated-user',
        status: OwnershipTransferStatus.PENDING,
      });

      await expect(
        service.acceptOwnership('org-id', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteOrganization', () => {
    it('should delete the organization if found', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-id',
        name: 'Acme',
      });

      await service.deleteOrganization('org-id');

      expect(mockPrisma.organization.delete).toHaveBeenCalledWith({
        where: { id: 'org-id' },
      });
    });

    it('should throw NotFoundException if org not found', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);

      await expect(service.deleteOrganization('org-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
