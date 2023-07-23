import { Answer } from 'src/dtos/data/answer/answer.dto';
import { AnswerService } from './answer.service';

describe('AnswerService', () => {
  let service: AnswerService;

  beforeEach(() => {
    service = new AnswerService();
  });

  it('should submit an answer', () => {
    const answerData: Answer = {
      userId: '123',
      questionId: '456',
      selectedOption: 'a',
    };

    const result = service.submitAnswer(answerData);

    expect(result).toBeDefined();
    expect(result.userId).toBe('123');
    expect(result.questionId).toBe('456');
    expect(result.selectedOption).toBe('a');
    expect(service.getAllAnswers()).toContain(result);
  });

  it('should get all answers', () => {
    const answerData1: Answer = {
      userId: '123',
      questionId: '456',
      selectedOption: 'a',
    };

    const answerData2: Answer = {
      userId: '789',
      questionId: '456',
      selectedOption: 'b',
    };

    service.submitAnswer(answerData1);
    service.submitAnswer(answerData2);

    const result = service.getAllAnswers();

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(answerData1);
    expect(result).toContainEqual(answerData2);
  });

  it('should get answers by question ID', () => {
    const answerData1: Answer = {
      userId: '123',
      questionId: '456',
      selectedOption: 'a',
    };

    const answerData2: Answer = {
      userId: '789',
      questionId: '789',
      selectedOption: 'b',
    };

    const answerData3: Answer = {
      userId: '456',
      questionId: '123',
      selectedOption: 'c',
    };

    service.submitAnswer(answerData1);
    service.submitAnswer(answerData2);
    service.submitAnswer(answerData3);

    const result = service.getAnswerByQuestionId('456');

    expect(result).toHaveLength(1);
    expect(result).toContainEqual(answerData1);
  });
});
