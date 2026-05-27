import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/auth/guard';
import { FormService } from './form.service';
import { GetUser } from '@/user/decorator';
import {
  AnswerResponseDto,
  DiscResultDto,
  FormQuestionResponseDto,
  InitFormDto,
  SubmitAnswerDto,
  UpdateAnswerDto,
  UserDto,
} from '@/core/dtos';
import { Form } from '../../generated/prisma/client';

@ApiTags('Form')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @ApiOperation({ summary: 'Get all forms for the authenticated user' })
  @ApiResponse({ status: '2XX', description: 'Forms retrieved successfully' })
  @Get()
  async getForms(@GetUser() user: UserDto) {
    return this.formService.getForms(user.id);
  }

  @ApiOperation({ summary: 'Get the next unanswered question or the result' })
  @ApiResponse({ status: 200, description: 'Next question or final result' })
  @Get(':id/next')
  async getNextQuestion(@Param('id') id: string) {
    return this.formService.getNextQuestion(id);
  }

  @ApiOperation({ summary: 'Review a question and its current answer' })
  @ApiResponse({
    status: 200,
    description: 'Question with current answer',
    type: FormQuestionResponseDto,
  })
  @Get(':id/question/:qId')
  async getFormQuestion(
    @Param('id') id: string,
    @Param('qId') qId: string,
  ): Promise<FormQuestionResponseDto> {
    return this.formService.getFormQuestion(id, qId);
  }

  @ApiOperation({ summary: 'Get DISC result for a form' })
  @ApiResponse({
    status: 200,
    description: 'DISC result computed successfully',
    type: DiscResultDto,
  })
  @Get(':id/result')
  async getDiscResult(@Param('id') id: string): Promise<DiscResultDto> {
    return this.formService.getDiscResult(id);
  }

  @ApiOperation({ summary: 'Get a form by id' })
  @ApiResponse({ status: '2XX', description: 'Form retrieved successfully' })
  @Get(':id')
  async getFormById(@Param('id') id: string) {
    return this.formService.getFormById(id);
  }

  @ApiOperation({ summary: 'Create and initialize a form' })
  @ApiResponse({ status: '2XX', description: 'Form created successfully' })
  @Post('init')
  async initForm(
    @Body() dto: InitFormDto,
    @GetUser() user: UserDto,
  ): Promise<Form> {
    return this.formService.initForm(dto.name, user.id);
  }

  @ApiOperation({ summary: 'Submit an answer for a question' })
  @ApiResponse({
    status: 201,
    description: 'Answer submitted with progress',
    type: AnswerResponseDto,
  })
  @Post(':id/answer')
  async submitAnswer(
    @Param('id') formId: string,
    @Body() dto: SubmitAnswerDto,
  ): Promise<AnswerResponseDto> {
    return this.formService.submitFormAnswer(
      formId,
      dto.questionId,
      dto.optionValue,
    );
  }

  @ApiOperation({ summary: 'Update an existing answer' })
  @ApiResponse({
    status: 200,
    description: 'Answer updated with progress',
    type: AnswerResponseDto,
  })
  @Put(':id/answer/:qId')
  async updateAnswer(
    @Param('id') formId: string,
    @Param('qId') qId: string,
    @Body() dto: UpdateAnswerDto,
  ): Promise<AnswerResponseDto> {
    return this.formService.updateFormAnswer(formId, qId, dto.optionValue);
  }
}
