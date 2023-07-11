import { Controller, Get, Param } from '@nestjs/common';
import { QuestionService } from '../services/question.service';
import { Question } from 'src/models/data/question.model';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOkResponse({ type: Array<Question> })
  @Get()
  getAllQuestions(): Question[] {
    return this.questionService.getAllQuestions();
  }

  @ApiOkResponse({ type: Question })
  @Get(':id')
  getQuestionById(@Param('id') id: string): Question | undefined {
    return this.questionService.getQuestionById(id);
  }
}
