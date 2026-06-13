import { ApiProperty } from '@nestjs/swagger';

export class Option {
  @ApiProperty({
    description: 'The value of the option',
    example: '1A',
  })
  value: string;

  @ApiProperty({
    description: 'The content of the option',
    example: 'Option A',
  })
  content: string;

  constructor({ value, content }: { value: string; content: string }) {
    this.value = value;
    this.content = content;
  }
}
