import { Injectable } from '@nestjs/common';
import { PostAnswerDto } from 'src/core/dtos';
import { PrismaService } from 'src/framework/prisma/prisma.service'; // Assurez-vous d'importer correctement votre service Prisma

@Injectable()
export class AnswerService {
  constructor(private readonly prisma: PrismaService) {}

  async submitAnswer(dto: PostAnswerDto) {
    const updateAtDate = new Date();
    try {
      const form = await this.prisma.form.findUnique({
        where: { id: dto.formId },
        select: {
          id: true,
        },
      });

      const createdAnswer = await this.prisma.answer.create({
        data: {
          form_id: form.id,
          question_id: dto.questionId,
          updated_at: updateAtDate,
          optionValue: dto.value,
        },
        select: {
          id: true,
        },
      });

      await this.prisma.form.update({
        where: { id: dto.formId },
        data: {
          answers: {
            upsert: {
              where: { id: createdAnswer.id },
              create: {
                id: createdAnswer.id,
                question_id: dto.questionId,
                updated_at: updateAtDate,
                optionValue: dto.value,
              },
              update: {
                id: createdAnswer.id,
                question_id: dto.questionId,
                updated_at: updateAtDate,
                optionValue: dto.value,
              },
            },
          },
          updated_at: updateAtDate,
        },
      });

      return 'form updated with new answer';
    } catch (error) {
      throw error;
    }
  }
}
