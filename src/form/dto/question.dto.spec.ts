import { QuestionResponseDto } from './question.dto';

describe('QuestionResponseDto', () => {
  it('should create an instance', () => {
    const data: QuestionResponseDto = {
      id: 'uuid-1',
      content: 'What is your favorite color?',
      options: [
        { value: '01_A', content: 'Red' },
        { value: '01_B', content: 'Blue' },
      ],
    };

    const dto = new QuestionResponseDto(data);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('uuid-1');
    expect(dto.content).toBe('What is your favorite color?');
    expect(dto.options).toHaveLength(2);
    expect(dto.options[0].value).toBe('01_A');
    expect(dto.options[0].content).toBe('Red');
    expect(dto.options[1].value).toBe('01_B');
    expect(dto.options[1].content).toBe('Blue');
  });
});
