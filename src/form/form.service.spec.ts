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
            question: {
              findMany: jest.fn(),
            },
            form: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
            },
            formQuestion: {
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
            },
            answer: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(FormService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initForm', () => {
    it('should create a form with 18 shuffled questions', async () => {
      const mockQuestions = Array.from({ length: 43 }, (_, i) => ({ id: `q-${i + 1}` }));
      const mockForm = { id: 'form-id', name: 'Test', status: 'in_progress', user_id: 'user1', created_at: new Date(), updated_at: null };

      prisma.question.findMany = jest.fn().mockResolvedValue(mockQuestions);
      prisma.form.create = jest.fn().mockResolvedValue(mockForm);

      const result = await service.initForm('Test', 'user1');

      expect(result).toEqual(mockForm);
      expect(prisma.question.findMany).toHaveBeenCalledWith({ select: { id: true } });
      expect(prisma.form.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test',
          user_id: 'user1',
          status: 'in_progress',
        }),
      });

      const createCall = (prisma.form.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.questions.create).toHaveLength(30);
    });
  });

  describe('getForms', () => {
    it('should return forms for a user', async () => {
      const mockForms = [{ id: 'f1' }];
      prisma.form.findMany = jest.fn().mockResolvedValue(mockForms);

      const result = await service.getForms('user1');

      expect(result).toEqual(mockForms);
      expect(prisma.form.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user1' },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('submitFormAnswer', () => {
    it('should create answer and mark question as answered', async () => {
      const formId = 'form-id';
      const mockFq = { id: 'fq-1', answered: false };
      const mockAnswer = { id: 'ans-1' };

      const mockFormWithAnswers = {
        id: formId,
        status: 'completed',
        answers: [
          {
            id: 'ans-1',
            question_id: 'q-1',
            optionValue: '01_A',
            Option: { dimension: 'D' },
            Question: { content: 'Question 1' },
          },
        ],
      };

      prisma.form.findUnique = jest
        .fn()
        .mockResolvedValueOnce({ id: formId, status: 'in_progress' })
        .mockResolvedValueOnce(mockFormWithAnswers)
        .mockResolvedValueOnce(mockFormWithAnswers);

      prisma.formQuestion.findUnique = jest.fn().mockResolvedValue(mockFq);
      prisma.answer.create = jest.fn().mockResolvedValue(mockAnswer);
      prisma.formQuestion.update = jest.fn().mockResolvedValue({ ...mockFq, answered: true });
      prisma.formQuestion.count = jest.fn().mockResolvedValue(18);
      prisma.form.update = jest.fn();

      const result = await service.submitFormAnswer(formId, 'q-1', '01_A');

      expect(result.progress.answered).toBe(18);
      expect(result.progress.remaining).toBe(0);
      expect(result.progress.status).toBe('completed');
    });
  });
});
