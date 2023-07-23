import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from '../services/question.service';
import { Question } from 'src/dtos/data/question.dto';

describe('QuestionController', () => {
  let controller: QuestionController;
  let questionService: QuestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionController],
      providers: [QuestionService],
    }).compile();

    controller = module.get<QuestionController>(QuestionController);
    questionService = module.get<QuestionService>(QuestionService);
  });

  it('should get all questions', () => {
    const questions: Question[] = [
      { id: 1, question: 'Question 1', options: [] },
      { id: 2, question: 'Question 2', options: [] },
    ];

    jest.spyOn(questionService, 'getAllQuestions').mockReturnValue(questions);

    const result = controller.getAllQuestions();

    expect(questionService.getAllQuestions).toHaveBeenCalled();
    expect(result).toBe(questions);
  });

  it('should get a question by id', () => {
    const questionId = '1';
    const question: Question = { id: 1, question: 'Question 1', options: [] };

    jest.spyOn(questionService, 'getQuestionById').mockReturnValue(question);

    const result = controller.getQuestionById(questionId);

    expect(questionService.getQuestionById).toHaveBeenCalledWith(questionId);
    expect(result).toBe(question);
  });
});
