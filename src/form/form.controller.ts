import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtGuard } from '@/auth/guard';
import { OptionalJwtGuard } from '@/common/guards';
import { FormAccessGuard } from './guards/form-access.guard';
import { FormService } from './form.service';
import { PdfGeneratorService } from './pdf/pdf-generator.service';
import { GetUser } from '@/user';
import {
  AnswerResponseDto,
  FormQuestionResponseDto,
  InitFormDto,
  SubmitAnswerDto,
  UpdateAnswerDto,
  UpdateFormNameDto,
} from './dto/form.dto';
import { DiscResultDto } from './dto/disc-result.dto';
import { UserDto } from '@/user/dto/user.dto';
import { Form } from '../../generated/prisma/client';

@ApiTags('Form')
@UseGuards(OptionalJwtGuard)
@Controller('form')
export class FormController {
  constructor(
    private readonly formService: FormService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all forms for the authenticated user' })
  @ApiResponse({ status: '2XX', description: 'Forms retrieved successfully' })
  @Get()
  async getForms(@GetUser() user: UserDto) {
    return this.formService.getForms(user.id);
  }

  @UseGuards(FormAccessGuard)
  @ApiOperation({ summary: 'Get the next unanswered question or the result' })
  @ApiResponse({ status: 200, description: 'Next question or final result' })
  @Get(':id/next')
  async getNextQuestion(@Param('id') id: string) {
    return this.formService.getNextQuestion(id);
  }

  @UseGuards(FormAccessGuard)
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

  @UseGuards(FormAccessGuard)
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

  @UseGuards(FormAccessGuard)
  @ApiOperation({ summary: 'Download DISC result as PDF' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF file downloaded successfully',
  })
  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.formService.getDiscResult(id);
    const profileCode = result.secondary
      ? `${result.primary}${result.secondary}`
      : result.primary;
    const filename = `Rapport_DISC_${profileCode}_${id}.pdf`;
    const pdfBuffer = await this.pdfGeneratorService.generatePdf(result);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.end(pdfBuffer);
  }

  @UseGuards(FormAccessGuard)
  @ApiOperation({ summary: 'Get a form by id' })
  @ApiResponse({ status: '2XX', description: 'Form retrieved successfully' })
  @Get(':id')
  async getFormById(@Param('id') id: string) {
    return this.formService.getFormById(id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create and initialize a form' })
  @ApiResponse({ status: '2XX', description: 'Form created successfully' })
  @Post('init')
  async initForm(
    @Body() dto: InitFormDto,
    @GetUser() user: UserDto,
  ): Promise<Form> {
    return this.formService.initForm(dto.name, user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a form and all its answers' })
  @ApiResponse({ status: 204, description: 'Form deleted successfully' })
  @Delete(':id')
  @HttpCode(204)
  async deleteForm(
    @Param('id') id: string,
    @GetUser() user: UserDto,
  ): Promise<void> {
    return this.formService.deleteForm(id, user.id);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rename a form' })
  @ApiResponse({ status: 200, description: 'Form renamed successfully' })
  @Patch(':id/name')
  async updateFormName(
    @Param('id') id: string,
    @GetUser() user: UserDto,
    @Body() dto: UpdateFormNameDto,
  ): Promise<Form> {
    return this.formService.updateFormName(id, user.id, dto.name);
  }

  @UseGuards(FormAccessGuard)
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

  @UseGuards(FormAccessGuard)
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
