import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            form: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            formQuestion: {
              deleteMany: jest.fn(),
            },
            answer: {
              deleteMany: jest.fn(),
            },
            organizationMember: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should delete user and all associated data', async () => {
      const mockUser = { id: 'uid' };
      const mockFormIds = [{ id: 'f1' }, { id: 'f2' }];

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.form.findMany = jest.fn().mockResolvedValue(mockFormIds);
      prisma.answer.deleteMany = jest.fn().mockResolvedValue({ count: 10 });
      prisma.formQuestion.deleteMany = jest.fn().mockResolvedValue({ count: 60 });
      prisma.form.deleteMany = jest.fn().mockResolvedValue({ count: 2 });
      prisma.user.delete = jest.fn().mockResolvedValue(mockUser);

      await service.deleteUser({ id: 'uid' });

      expect(prisma.form.findMany).toHaveBeenCalledWith({
        where: { member: { userId: 'uid' } },
        select: { id: true },
      });
      expect(prisma.answer.deleteMany).toHaveBeenCalledWith({
        where: { form_id: { in: ['f1', 'f2'] } },
      });
      expect(prisma.formQuestion.deleteMany).toHaveBeenCalledWith({
        where: { formId: { in: ['f1', 'f2'] } },
      });
      expect(prisma.form.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['f1', 'f2'] } },
      });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'uid' } });
    });

    it('should delete user without associated forms', async () => {
      const mockUser = { id: 'uid' };

      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      prisma.form.findMany = jest.fn().mockResolvedValue([]);
      prisma.user.delete = jest.fn().mockResolvedValue(mockUser);

      await service.deleteUser({ id: 'uid' });

      expect(prisma.answer.deleteMany).not.toHaveBeenCalled();
      expect(prisma.formQuestion.deleteMany).not.toHaveBeenCalled();
      expect(prisma.form.deleteMany).not.toHaveBeenCalled();
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'uid' } });
    });

    it('should throw if user not found', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deleteUser({ id: 'nonexistent' })).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update all profile fields', async () => {
      const mockUser = {
        id: 'uid',
        email: 'new@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: new Date('1990-05-15'),
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.update = jest.fn().mockResolvedValue(mockUser);

      const result = await service.updateProfile('uid', {
        firstName: 'John',
        lastName: 'Doe',
        email: 'new@example.com',
        birthDate: '1990-05-15',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uid' },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'new@example.com',
          birthDate: new Date('1990-05-15'),
        },
      });
    });

    it('should update only provided fields', async () => {
      const mockUser = {
        id: 'uid',
        email: 'old@example.com',
        firstName: 'John',
      };

      prisma.user.update = jest.fn().mockResolvedValue(mockUser);

      const result = await service.updateProfile('uid', {
        firstName: 'John',
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uid' },
        data: { firstName: 'John' },
      });
    });

    it('should throw ConflictException if email is taken', async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'other-user',
        email: 'taken@example.com',
      });

      await expect(
        service.updateProfile('uid', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to own email', async () => {
      const mockUser = {
        id: 'uid',
        email: 'mine@example.com',
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 'uid',
        email: 'mine@example.com',
      });
      prisma.user.update = jest.fn().mockResolvedValue(mockUser);

      const result = await service.updateProfile('uid', {
        email: 'mine@example.com',
      });

      expect(result).toEqual(mockUser);
    });
  });
});
