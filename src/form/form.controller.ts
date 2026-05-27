import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '@/auth/guard';
import { FormService } from './form.service';
import { GetUser } from '@/user/decorator';
import { InitFormDto, UserDto } from '@/core/dtos';
import { Form } from '@prisma/client';

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
}
