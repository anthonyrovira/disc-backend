import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Question as QuestionDto } from 'src/core/dtos/question/question.dto';
import { QuestionService } from './question.service';
import { JwtGuard } from 'src/auth/guard';
import { Question } from '@prisma/client';

@UseGuards(JwtGuard)
@ApiTags('Question')
@Controller('questions')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: 'Get all questions' })
  @ApiOkResponse({ type: Array<Question> })
  @Get()
  getAllQuestions(): Promise<Question[]> {
    return this.questionService.getAllQuestions();
  }

  @ApiOperation({ summary: 'Get a question by id' })
  @ApiOkResponse({ type: QuestionDto })
  @Get(':id')
  getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }
}
