import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guard';
import { FormService } from './form.service';
import { Form } from '@prisma/client';
import { InitFormDto } from 'src/core/dtos';

@ApiTags('Form')
@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('form')
export class FormController {
  constructor(private readonly formService: FormService) {}

  @ApiOperation({ summary: 'Create and initialize a form' })
  @ApiOkResponse({
    status: '2XX',
    description: 'Form created successfully',
  })
  @Post('init')
  async initForm(@Body() dto: InitFormDto): Promise<Form> {
    return this.formService.initForm(dto);
  }
}
