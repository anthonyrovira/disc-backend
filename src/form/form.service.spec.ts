// form.service.spec.ts

import { Test } from '@nestjs/testing';
import { FormService } from './form.service';
import { PrismaService } from '@/framework/prisma/prisma.service';

describe('FormService', () => {
  let service: FormService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FormService,
        {
          provide: PrismaService,
          useValue: {
            form: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(FormService);
    prisma = module.get(PrismaService);
  });

  it('should create a new form', async () => {
    const name = 'Test Form';
    const userId = '1234';

    await service.initForm(name, userId);

    expect(prisma.form.create).toHaveBeenCalledWith({
      data: {
        name,
        user_id: userId,
        created_at: expect.any(Date),
      },
    });
  });
});
