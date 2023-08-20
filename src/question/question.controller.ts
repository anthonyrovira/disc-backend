import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Question } from 'src/core/dtos/question/question.dto';
import { QuestionService } from './question.service';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@ApiTags('Question')
@Controller('questions')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: 'Get all questions' })
  @ApiOkResponse({ type: Array<Question> })
  @Get()
  getAllQuestions(): Question[] {
    return this.questionService.getAllQuestions();
  }

  @ApiOperation({ summary: 'Get a question by id' })
  @ApiOkResponse({ type: Question })
  @Get(':id')
  getQuestionById(@Param('id') id: string): Question | undefined {
    return this.questionService.getQuestionById(id);
  }
}
