import { ApiProperty } from '@nestjs/swagger';
import { Option } from '../option/option.dto';

export class QuestionResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the question',
    example: 'uuid-1',
  })
  id: string;

  @ApiProperty({
    description: 'The text of the question',
    example: 'What is your favorite color?',
  })
  content: string;

  @ApiProperty({
    isArray: true,
    description: 'The options for the question',
  })
  options: Option[];

  constructor({
    id,
    content,
    options,
  }: {
    id: string;
    content: string;
    options: Option[];
  }) {
    this.id = id;
    this.content = content;
    this.options = options;
  }
}
