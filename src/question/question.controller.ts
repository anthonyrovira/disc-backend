import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Question as QuestionDto } from '@/core/dtos/question/question.dto';
import { QuestionService } from './question.service';
import { JwtGuard } from '@/auth/guard';
import { Question } from '../../generated/prisma/client';

@UseGuards(JwtGuard)
@ApiTags('Question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ type: Array<Question> })
  @Get()
  getAllQuestions(): Promise<Question[]> {
    return this.questionService.getAllQuestions();
  }

  @ApiOperation({ summary: 'Get a question by id' })
  @ApiResponse({ type: QuestionDto })
  @Get(':id')
  getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }
}
