import { ApiProperty } from '@nestjs/swagger';
import { DiscDimension } from '../../../../generated/prisma/client';

export class AnswerDetailDto {
  @ApiProperty({ description: 'The question id', example: 'uuid-1' })
  questionId: string;

  @ApiProperty({ description: 'The question content', example: "Concernant votre poignée de main :" })
  questionContent: string;

  @ApiProperty({ description: 'The selected option value', example: '01_A' })
  optionValue: string;

  @ApiProperty({ description: 'The selected option content', example: 'Elle est ferme et plutôt appuyée.' })
  optionContent: string;

  @ApiProperty({ description: 'The DISC dimension', example: 'D' })
  dimension: DiscDimension;
}

export class DiscScoresDto {
  @ApiProperty({ description: 'Dominance score', example: 7 })
  D: number;

  @ApiProperty({ description: 'Influence score', example: 5 })
  I: number;

  @ApiProperty({ description: 'Steadiness score', example: 3 })
  S: number;

  @ApiProperty({ description: 'Conscientiousness score', example: 3 })
  C: number;
}

export class DiscResultDto {
  @ApiProperty({ description: 'Scores per dimension' })
  scores: DiscScoresDto;

  @ApiProperty({ description: 'Primary DISC dimension', example: 'D' })
  primary: DiscDimension;

  @ApiProperty({ description: 'Secondary DISC dimension', example: 'I', nullable: true })
  secondary: DiscDimension | null;

  @ApiProperty({ description: 'Profile code', example: 'Di' })
  profile: string;

  @ApiProperty({ description: 'Total number of answers', example: 18 })
  total: number;

  @ApiProperty({ description: 'List of answers with dimension details', type: [AnswerDetailDto] })
  answers: AnswerDetailDto[];
}
