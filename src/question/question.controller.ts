import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QuestionResponseDto } from '@/core/dtos/question/question.dto';
import { QuestionService } from './question.service';
import { JwtGuard } from '@/auth/guard';
import { Question as QuestionModel } from '../../generated/prisma/client';

@UseGuards(JwtGuard)
@ApiTags('Question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: 'Get all questions' })
  @ApiResponse({ type: Array<QuestionModel> })
  @Get()
  getAllQuestions(): Promise<QuestionModel[]> {
    return this.questionService.getAllQuestions();
  }

  @ApiOperation({ summary: 'Get a question by id' })
  @ApiResponse({ type: QuestionResponseDto })
  @Get(':id')
  getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }
}
