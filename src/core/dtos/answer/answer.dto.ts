import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class PostAnswerDto {
  @ApiProperty({
    description: 'The user id',
    example: 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

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
    userId,
    formId,
    questionId,
    value,
  }: {
    userId: string;
    formId: string;
    questionId: number;
    value: string;
  }) {
    this.userId = userId;
    this.formId = formId;
    this.questionId = questionId;
    this.value = value;
  }
}
