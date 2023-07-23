import { ApiProperty } from '@nestjs/swagger';
import { Option } from './option.dto';

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
    type: Option,
    isArray: true,
    description: 'The options for the question',
  })
  options: Option[];

  constructor(data: any) {
    this.id = data.id;
    this.question = data.question;
    this.options = data.options.map(
      (dataOption: any) => new Option(dataOption),
    );
  }
}
