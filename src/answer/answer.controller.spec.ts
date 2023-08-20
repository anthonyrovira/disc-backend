// answer.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { PostAnswerDto } from 'src/core/dtos';

describe('AnswerController', () => {
  let controller: AnswerController;
  let service: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerController],
      providers: [
        {
          provide: AnswerService,
          useValue: {
            submitAnswer: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnswerController>(AnswerController);
    service = module.get<AnswerService>(AnswerService);
  });

  const mockDto: PostAnswerDto = {
    formId: 'form-id',
    userId: 'user-id',
    questionId: 10,
    value: 'option-value',
  };

  it('should call submitAnswer method', async () => {
    await controller.submitAnswer(mockDto);

    expect(service.submitAnswer).toHaveBeenCalledWith(mockDto);
  });

  it('should return success message', async () => {
    jest
      .spyOn(service, 'submitAnswer')
      .mockResolvedValue('form updated with new answer');

    const result = await controller.submitAnswer(mockDto);

    expect(result).toEqual('form updated with new answer');
  });
});
