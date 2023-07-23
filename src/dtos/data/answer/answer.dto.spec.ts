import { Answer } from './answer.dto';

describe('Answer DTO', () => {
  it('should create a new answer instance', () => {
    const userId = '123';
    const questionId = '456';
    const selectedOption = 'a';

    const answer = new Answer(userId, questionId, selectedOption);

    expect(answer.userId).toEqual(userId);
    expect(answer.questionId).toEqual(questionId);
    expect(answer.selectedOption).toEqual(selectedOption);
  });
});
