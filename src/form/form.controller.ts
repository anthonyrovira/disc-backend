import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/auth/guard';
import { FormService } from './form.service';
import { Form } from '@prisma/client';
import { InitFormDto } from '@/core/dtos';

@ApiTags('Form')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  // @ApiOperation({ summary: 'Get all forms' })
  // @ApiResponse({
  //   status: '2XX',
  //   description: 'Form created successfully',
  // })
  // @Get()
  // async getForms() {
  //   return this.formService.getForms();
  // }

  // @ApiOperation({ summary: 'Get a form by id' })
  // @ApiResponse({
  //   status: '2XX',
  //   description: 'Form created successfully',
  // })
  // @Get(':id')
  // async getFormById(@Param('formId') formId: string) {
  //   return this.formService.getFormById(formId);
  // }

  @ApiOperation({ summary: 'Create and initialize a form' })
  @ApiResponse({
    status: '2XX',
    description: 'Form created successfully',
  })
  @Post('init')
  async initForm(@Body() dto: InitFormDto): Promise<Form> {
    return this.formService.initForm(dto);
  }
}
