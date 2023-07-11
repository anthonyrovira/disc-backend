import { ApiProperty } from '@nestjs/swagger';

export class Option {
  @ApiProperty({
    description: 'The unique identifier of the option',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'The content of the option',
    example: 'Option A',
  })
  content: string;

  constructor(data: any) {
    this.id = data.id;
    this.content = data.text;
  }
}
