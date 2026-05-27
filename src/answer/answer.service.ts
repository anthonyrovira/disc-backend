import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/framework/prisma/prisma.service';
import { PostAnswerDto } from '../core/dtos';

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async submitAnswer(dto: PostAnswerDto) {
    const form = await this.prisma.form.findUnique({
      where: { id: dto.formId },
      select: { id: true },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${dto.formId} not found`);
    }

    await this.prisma.answer.create({
      data: {
        form_id: form.id,
        question_id: dto.questionId,
        optionValue: dto.value,
      },
    });

    await this.prisma.form.update({
      where: { id: dto.formId },
      data: { updated_at: new Date() },
    });

    return 'Answer submitted successfully';
  }
}
