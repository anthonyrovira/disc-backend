import { Controller, Post, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Answer } from 'src/dtos/data/answer/answer.dto';
import { AnswerService } from 'src/services/answer/answer.service';

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
