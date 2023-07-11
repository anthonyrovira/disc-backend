import { Controller, Get, Param } from '@nestjs/common';
import { QuestionService } from '../services/question.service';
import { Question } from 'src/models/data/question.model';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Question')
@Controller('questions')
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
