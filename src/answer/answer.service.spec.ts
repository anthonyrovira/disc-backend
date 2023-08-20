// answer.service.spec.ts

import { Answer, Form } from '@prisma/client';
import { PostAnswerDto } from 'src/core/dtos';
import { AnswerService } from './answer.service';
import { PrismaService } from 'src/framework/prisma/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('AnswerService', () => {
  let answerService: AnswerService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnswerService,
        {
          provide: PrismaService,
          useValue: {
            form: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            answer: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    answerService = module.get<AnswerService>(AnswerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(answerService).toBeDefined();
  });

  describe('submitAnswer', () => {
    it('should submit and update answer', async () => {
      const mockDto: PostAnswerDto = {
        formId: 'form-id',
        userId: 'user-id',
        questionId: 10,
        value: 'option-value',
      };

      const mockForm: { id: Form['id'] } = {
        id: 'form-id',
      };

      const mockCreatedAnswer: { id: Answer['id'] } = {
        id: 'answer-id',
      };

      prismaService.form.findUnique = jest.fn().mockResolvedValue(mockForm);
      prismaService.answer.create = jest
        .fn()
        .mockResolvedValue(mockCreatedAnswer);

      const result = await answerService.submitAnswer(mockDto);

      expect(result).toBe('form updated with new answer');
      expect(prismaService.form.findUnique).toHaveBeenCalledWith({
        where: { id: mockDto.formId },
        select: {
          id: true,
        },
      });
      expect(prismaService.answer.create).toHaveBeenCalledWith({
        data: {
          form_id: mockForm.id,
          question_id: mockDto.questionId,
          updated_at: expect.any(Date),
          optionValue: mockDto.value,
        },
        select: {
          id: true,
        },
      });
      expect(prismaService.form.update).toHaveBeenCalledWith({
        where: { id: mockDto.formId },
        data: {
          answers: {
            upsert: {
              where: { id: mockCreatedAnswer.id },
              create: expect.any(Object),
              update: expect.any(Object),
            },
          },
          updated_at: expect.any(Date),
        },
      });
    });
  });
});
