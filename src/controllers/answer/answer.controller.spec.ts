import { Test, TestingModule } from '@nestjs/testing';
import { AnswerController } from './answer.controller';
import { AnswerService } from '../services/answer.service';
import { Answer } from '../dtos/data/answer.dto';

describe('AnswerController', () => {
  let controller: AnswerController;
  let answerService: AnswerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerController],
      providers: [AnswerService],
    }).compile();

    controller = module.get<AnswerController>(AnswerController);
    answerService = module.get<AnswerService>(AnswerService);
  });

  it('should submit an answer', () => {
    const answerData: Answer = {
      userId: '123',
      questionId: '456',
      selectedOption: 'a',
    };

    const newAnswer: Answer = {
      userId: '123',
      questionId: '456',
      selectedOption: 'a',
    };

    jest.spyOn(answerService, 'submitAnswer').mockReturnValue(newAnswer);

    const result = controller.submitAnswer(answerData);

    expect(answerService.submitAnswer).toHaveBeenCalledWith(answerData);
    expect(result).toBe(newAnswer);
  });
});
