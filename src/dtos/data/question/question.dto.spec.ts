import { Question } from './question.dto';
import { Option } from '../option/option.dto';

describe('Question DTO', () => {
  it('should create a new question instance', () => {
    const data = {
      id: 1,
      question: 'What is your favorite color?',
      options: [
        { id: 'a', content: 'Red' },
        { id: 'b', content: 'Blue' },
        { id: 'c', content: 'Green' },
      ],
    };

    const question = new Question(data);

    expect(question.id).toEqual(data.id);
    expect(question.question).toEqual(data.question);
    expect(question.options).toHaveLength(data.options.length);
    expect(question.options[0]).toBeInstanceOf(Option);
  });
});
