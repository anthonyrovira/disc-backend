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
  let prisma: any;

  const mockPrisma = () => ({
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    organizationMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    ownershipTransfer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    formOrganization: {
      findMany: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    form: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  });

  beforeEach(async () => {
    prisma = mockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization with the user as OWNER', async () => {
      const mockOrg = { id: 'org-id', name: 'Acme', createdAt: new Date() };
      prisma.user.findUnique.mockResolvedValue({ id: 'user-id', email: 'owner@test.com', firstName: 'Owner' });
      prisma.organization.create.mockResolvedValue(mockOrg);

      const result = await service.create('user-id', { name: 'Acme' });

      expect(result.id).toBe('org-id');
      expect(result.name).toBe('Acme');
      expect(prisma.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'Acme',
          members: {
            create: { userId: 'user-id', email: 'owner@test.com', firstName: 'Owner', role: OrganizationRole.OWNER },
          },
        },
      });
    });
  });

  describe('findById', () => {
    it('should return the organization if found', async () => {
      const mockOrg = { id: 'org-id', name: 'Acme', createdAt: new Date() };
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.findById('org-id');
      expect(result.id).toBe('org-id');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.findById('org-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMembers', () => {
    it('should return all members (OWNER, MANAGER, EMPLOYEE)', async () => {
      const testDate = new Date('2025-06-01');

      prisma.formOrganization.findMany.mockResolvedValue([
        { form: { memberId: 'm1', updated_at: testDate, status: 'completed' } },
      ]);

      prisma.organizationMember.findMany.mockResolvedValue([
        {
          id: 'm1',
          userId: 'u1',
          email: 'owner@test.com',
          firstName: 'Owner',
          lastName: null,
          role: OrganizationRole.OWNER,
          joinedAt: new Date(),
          user: { id: 'u1', email: 'owner@test.com', firstName: 'Owner', lastName: null },
          team: null,
        },
        {
          id: 'm2',
          userId: 'u2',
          email: 'manager@test.com',
          firstName: 'Jane',
          lastName: null,
          role: OrganizationRole.MANAGER,
          joinedAt: new Date(),
          user: { id: 'u2', email: 'manager@test.com', firstName: 'Jane', lastName: null },
          team: { id: 't1', name: 'Engineering' },
        },
        {
          id: 'm3',
          userId: null,
          email: 'emp@test.com',
          firstName: 'Bob',
          lastName: null,
          role: OrganizationRole.EMPLOYEE,
          joinedAt: new Date(),
          user: null,
          team: null,
        },
      ]);

      const result = await service.getMembers('org-id');

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe(OrganizationRole.OWNER);
      expect(result[1].role).toBe(OrganizationRole.MANAGER);
      expect(result[1].teamName).toBe('Engineering');
      expect(result[2].role).toBe(OrganizationRole.EMPLOYEE);
    });
  });

  describe('getMembership', () => {
    it('should return membership if exists', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({
        userId: 'u1',
        organizationId: 'org-id',
        role: OrganizationRole.MANAGER,
      });

      const result = await service.getMembership('u1', 'org-id');
      expect(result!.role).toBe(OrganizationRole.MANAGER);
    });
  });

  describe('removeMember', () => {
    it('should remove a non-OWNER member', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'm2',
        userId: 'u2',
        organizationId: 'org-id',
        role: OrganizationRole.MANAGER,
      });

      await service.removeMember('org-id', 'u2');
      expect(prisma.organizationMember.delete).toHaveBeenCalledWith({ where: { id: 'm2' } });
    });

    it('should throw ForbiddenException if target is OWNER', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'm1',
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
      prisma.formOrganization.findMany.mockResolvedValue([
        {
          form: {
            status: 'completed',
            updated_at: new Date(),
            member: { id: 'm1', userId: 'u1', email: 'm1@test.com', firstName: 'A', lastName: null, role: OrganizationRole.OWNER, teamId: null, team: null },
            answers: [
              { optionValue: 'q0_D', Option: { dimension: 'D' } },
              { optionValue: 'q1_I', Option: { dimension: 'I' } },
              { optionValue: 'q2_S', Option: { dimension: 'S' } },
            ],
          },
        },
      ]);

      prisma.organizationMember.findMany.mockResolvedValue([
        {
          id: 'm1',
          userId: 'u1',
          email: 'm1@test.com',
          firstName: 'A',
          lastName: null,
          role: OrganizationRole.OWNER,
          teamId: null,
          invitedById: null,
          organizationId: 'org-id',
          joinedAt: new Date(),
        },
      ]);

      const result = await service.getDashboardResults('org-id');

      expect(result.total).toBe(1);
      expect(result.members).toHaveLength(1);
      expect(result.members[0].D).toBe(1);
    });
  });

  describe('initiateTransfer', () => {
    it('should create a pending transfer', async () => {
      prisma.organizationMember.findUnique.mockResolvedValue({
        id: 'm2',
        userId: 'target-id',
        organizationId: 'org-id',
        role: OrganizationRole.MANAGER,
      });
      prisma.ownershipTransfer.findUnique.mockResolvedValue(null);

      await service.initiateTransfer('org-id', 'owner-id', 'target-id');
      expect(prisma.ownershipTransfer.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if target is self', async () => {
      await expect(
        service.initiateTransfer('org-id', 'owner-id', 'owner-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Teams', () => {
    it('should create a team', async () => {
      prisma.team.findUnique.mockResolvedValue(null);
      prisma.team.create.mockResolvedValue({ id: 't1', name: 'Eng', createdAt: new Date(), organizationId: 'org-id' });

      const result = await service.createTeam('org-id', 'Eng');
      expect(result.name).toBe('Eng');
    });

    it('should list teams', async () => {
      prisma.team.findMany.mockResolvedValue([
        { id: 't1', name: 'Eng', createdAt: new Date() },
      ]);

      const result = await service.getTeams('org-id');
      expect(result).toHaveLength(1);
    });

    it('should delete team and unassign members', async () => {
      prisma.team.findUnique.mockResolvedValue({ id: 't1', organizationId: 'org-id', name: 'Eng', createdAt: new Date() });
      prisma.$transaction.mockImplementation(async (input: any) => {
        if (Array.isArray(input)) {
          await Promise.all(input);
        }
        return undefined;
      });

      await service.deleteTeam('t1');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('Participants', () => {
    it('should list participants', async () => {
      prisma.organizationMember.findMany.mockResolvedValue([
        {
          id: 'm3',
          email: 'c@t.com',
          firstName: 'C',
          lastName: null,
          role: OrganizationRole.CANDIDATE,
          joinedAt: new Date(),
          team: null,
        },
      ]);
      prisma.form.findMany.mockResolvedValue([]);

      const result = await service.getParticipants('org-id');
      expect(result).toHaveLength(1);
    });

    it('should get candidates', async () => {
      prisma.organizationMember.findMany.mockResolvedValue([]);
      prisma.form.findMany.mockResolvedValue([]);

      const result = await service.getCandidates('org-id');
      expect(result).toEqual([]);
    });
  });
});
