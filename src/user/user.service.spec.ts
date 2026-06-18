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
            organizationMembership: {
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
        where: { user_id: 'uid' },
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
});
