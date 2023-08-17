import { Question } from './question.dto';

describe('Question', () => {
  it('should create an instance', () => {
    const data = {
      id: 1,
      question: 'What is your favorite color?',
      options: [
        { id: 'uuid1', content: 'Red', question_id: 2 },
        { id: 'uuid2', content: 'Blue', question_id: 2 },
      ],
    };

    const questionDto = new Question(data);

    expect(questionDto).toBeDefined();
    expect(questionDto.id).toBe(1);
    expect(questionDto.question).toBe('What is your favorite color?');
    expect(questionDto.options).toHaveLength(2);
    expect(questionDto.options[0].id).toBe('uuid1');
    expect(questionDto.options[0].content).toBe('Red');
    expect(questionDto.options[0].question_id).toBe(2);
    expect(questionDto.options[1].id).toBe('uuid2');
    expect(questionDto.options[1].content).toBe('Blue');
    expect(questionDto.options[1].question_id).toBe(2);
  });
});
