import { Controller, Post, Body } from '@nestjs/common';
import { AnswerService } from '../services/answer.service';
import { Answer } from '../dtos/data/answer.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Answers')
@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiOperation({ summary: 'Post answer' })
  @ApiOkResponse({ type: Object })
  @Post()
  submitAnswer(@Body() answerData: Answer) {
    return this.answerService.submitAnswer(answerData);
  }
}
