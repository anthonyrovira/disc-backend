import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class PostAnswerDto {
  @ApiProperty({
    description: 'The form id',
    example: 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  formId: string;

  @ApiProperty({
    description: 'The question id',
    example: '13',
  })
  @IsInt()
  @IsNotEmpty()
  questionId: number;

  @ApiProperty({
    description: 'The answer value',
    example: '11_D',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  constructor({
    formId,
    questionId,
    value,
  }: {
    formId: string;
    questionId: number;
    value: string;
  }) {
    this.formId = formId;
    this.questionId = questionId;
    this.value = value;
  }
}
