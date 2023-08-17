import { ApiProperty } from '@nestjs/swagger';
import { Option } from '../option/option.dto';

export class Question {
  @ApiProperty({
    description: 'The unique identifier of the question',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The text of the question',
    example: 'What is your favorite color?',
  })
  question: string;

  @ApiProperty({
    isArray: true,
    description: 'The options for the question',
  })
  options: Option[];

  constructor({
    id,
    question,
    options,
  }: {
    id: number;
    question: string;
    options: Option[];
  }) {
    this.id = id;
    this.question = question;
    this.options = options;
  }
}
