import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnswerService } from './answer.service';
import { JwtGuard } from 'src/auth/guard';
import { PostAnswerDto } from 'src/core/dtos';

@ApiTags('Answer')
@Controller('answer')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiOperation({ summary: 'Submit an answer' })
  @ApiOkResponse({
    status: '2XX',
    description: 'Answer submitted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  async submitAnswer(@Body() dto: PostAnswerDto): Promise<string> {
    return this.answerService.submitAnswer(dto);
  }
}
