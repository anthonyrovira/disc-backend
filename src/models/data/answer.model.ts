import { ApiProperty } from '@nestjs/swagger';

export class Answer {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: '123',
  })
  userId: string;

  @ApiProperty({
    description: 'The unique identifier of the question',
    example: '456',
  })
  questionId: string;

  @ApiProperty({
    description: 'The selected option for the answer',
    example: 'a',
  })
  selectedOption: string;

  constructor(userId: string, questionId: string, selectedOption: string) {
    this.userId = userId;
    this.questionId = questionId;
    this.selectedOption = selectedOption;
  }
}
