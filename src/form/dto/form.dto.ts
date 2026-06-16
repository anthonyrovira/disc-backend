import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { DiscResultDto } from './disc-result.dto';

export class InitFormDto {
  @ApiProperty({ description: 'The form name', example: 'super_test' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AnswerProgressDto {
  @ApiProperty({ description: 'Total questions count', example: 18 })
  totalQuestions: number;

  @ApiProperty({ description: 'Number of answered questions', example: 7 })
  answered: number;

  @ApiProperty({ description: 'Number of remaining questions', example: 11 })
  remaining: number;

  @ApiProperty({ description: 'Form status', example: 'in_progress' })
  status: string;
}

export class OptionResponseDto {
  @ApiProperty({ description: 'The option value', example: '01_A' })
  value: string;

  @ApiProperty({ description: 'The option content', example: 'Elle est ferme et plutôt appuyée.' })
  content: string;
}

export class NextQuestionDataDto {
  @ApiProperty({ description: 'Question ID', example: 'uuid-1' })
  id: string;

  @ApiProperty({ description: 'Question content', example: "Concernant votre poignée de main :" })
  content: string;

  @ApiProperty({ description: 'Available options', type: [OptionResponseDto], isArray: true })
  options: OptionResponseDto[];
}

export class NextQuestionResponseDto {
  @ApiProperty({ description: 'Form ID' })
  formId: string;

  @ApiProperty({ description: 'The next question' })
  question: NextQuestionDataDto;

  @ApiProperty({ description: 'Progress information' })
  progress: AnswerProgressDto;
}

export class FormResultResponseDto {
  @ApiProperty({ description: 'Form ID' })
  formId: string;

  @ApiProperty({ description: 'DISC result' })
  result: DiscResultDto;

  @ApiProperty({ description: 'Progress information' })
  progress: AnswerProgressDto;
}

export class SubmitAnswerDto {
  @ApiProperty({ description: 'Question ID', example: 'uuid-1' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Selected option value', example: '01_A' })
  @IsString()
  @IsNotEmpty()
  optionValue: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ description: 'New option value', example: '01_B' })
  @IsString()
  @IsNotEmpty()
  optionValue: string;
}

export class FormQuestionResponseDto {
  @ApiProperty({ description: 'Question ID', example: 'uuid-1' })
  questionId: string;

  @ApiProperty({ description: 'Question content' })
  questionContent: string;

  @ApiProperty({ type: [OptionResponseDto], isArray: true })
  options: OptionResponseDto[];

  @ApiPropertyOptional({ description: 'Current selected option value', example: '01_A' })
  currentAnswer?: string;
}

export class AnswerResponseDto {
  @ApiProperty({ description: 'The progress after this answer' })
  progress: AnswerProgressDto;

  @ApiPropertyOptional({ type: DiscResultDto, description: 'DISC result if form is completed' })
  result?: DiscResultDto;
}

export type FormNames = 'disc_form';
