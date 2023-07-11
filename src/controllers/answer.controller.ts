import { Controller, Post, Body } from '@nestjs/common';
import { AnswerService } from '../services/answer.service';
import { Answer } from '../models/data/answer.model';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Answers')
@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiOkResponse({ type: Object })
  @Post()
  submitAnswer(@Body() answerData: Answer) {
    return this.answerService.submitAnswer(answerData);
  }
}
