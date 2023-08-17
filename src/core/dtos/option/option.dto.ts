import { ApiProperty } from '@nestjs/swagger';

export class Option {
  @ApiProperty({
    description: 'The unique identifier of the option',
    example: 'a',
  })
  id: string;

  @ApiProperty({
    description: 'The content of the option',
    example: 'Option A',
  })
  content: string;

  @ApiProperty({
    description: 'The unique identifier of the question',
    example: 10,
  })
  question_id: number;

  constructor(data: any) {
    this.id = data.id;
    this.content = data.text;
    this.question_id = data.question_id;
  }
}
