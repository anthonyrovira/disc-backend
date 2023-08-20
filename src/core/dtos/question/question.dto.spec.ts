import { Question } from './question.dto';

describe('Question', () => {
  it('should create an instance', () => {
    const data: Question = {
      id: 1,
      question: 'What is your favorite color?',
      options: [
        { value: '01_A', content: 'Red' },
        { value: '01_B', content: 'Blue' },
      ],
    };

    const questionDto = new Question(data);

    expect(questionDto).toBeDefined();
    expect(questionDto.id).toBe(1);
    expect(questionDto.question).toBe('What is your favorite color?');
    expect(questionDto.options).toHaveLength(2);
    expect(questionDto.options[0].value).toBe('01_A');
    expect(questionDto.options[0].content).toBe('Red');
    expect(questionDto.options[1].value).toBe('01_B');
    expect(questionDto.options[1].content).toBe('Blue');
  });
});
