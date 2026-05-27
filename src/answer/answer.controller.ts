import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AnswerService } from './answer.service';
import { JwtGuard } from '@/auth/guard';
import { PostAnswerDto } from '@/core/dtos';

@ApiTags('Answer')
@Controller('answer')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @ApiOperation({ summary: 'Submit an answer' })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted successfully',
  })
  @Post()
  async submitAnswer(@Body() dto: PostAnswerDto) {
    return this.answerService.submitAnswer(dto);
  }
}
