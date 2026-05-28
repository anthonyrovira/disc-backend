import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/framework/prisma/prisma.service';
import {
  AnswerProgressDto,
  AnswerResponseDto,
  DiscResultDto,
  DiscScoresDto,
  AnswerDetailDto,
  FormQuestionResponseDto,
  NextQuestionDataDto,
} from '@/core/dtos';
import { Form } from '../../generated/prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async getForms(userId: string): Promise<Form[]> {
    return this.prisma.form.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getFormById(id: string): Promise<Form> {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
    return form;
  }

  async initForm(name: string, userId: string): Promise<Form> {
    return this.createForm(name, userId);
  }

  async initAnonForm(name: string): Promise<Form> {
    return this.createForm(name, null);
  }

  private async createForm(name: string, userId: string | null): Promise<Form> {
    const allQuestions = await this.prisma.question.findMany({
      select: { id: true },
    });

    const shuffled = this.shuffle(allQuestions.map((q) => q.id)).slice(0, 30);

    return this.prisma.form.create({
      data: {
        name,
        user_id: userId,
        status: 'in_progress',
        created_at: new Date(),
        questions: {
          create: shuffled.map((questionId, index) => ({
            questionId,
            order: index + 1,
          })),
        },
      },
    });
  }

  async claimForm(formId: string, userId: string): Promise<Form> {
    return this.prisma.$transaction(async (tx) => {
      const form = await tx.form.findUnique({ where: { id: formId } });

      if (!form) {
        throw new NotFoundException(`Form with ID ${formId} not found`);
      }

      if (form.user_id !== null) {
        throw new ConflictException('This form is already associated with an account');
      }

      return tx.form.update({
        where: { id: formId },
        data: { user_id: userId, updated_at: new Date() },
      });
    });
  }

  async getNextQuestion(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    const progress = await this.getProgress(formId);
    const next = form.questions.find((fq) => !fq.answered);

    if (!next) {
      await this.completeForm(formId);
      const result = await this.getDiscResult(formId);
      progress.status = 'completed';
      return { formId, result, progress };
    }

    return {
      formId,
      question: {
        id: next.question.id,
        content: next.question.content,
        options: next.question.options.map((o) => ({
          value: o.value,
          content: o.content,
        })),
      } as NextQuestionDataDto,
      progress,
    };
  }

  async getFormQuestion(
    formId: string,
    questionId: string,
  ): Promise<FormQuestionResponseDto> {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const answer = await this.prisma.answer.findUnique({
      where: {
        form_id_question_id: { form_id: formId, question_id: questionId },
      },
    });

    return {
      questionId: question.id,
      questionContent: question.content,
      options: question.options.map((o) => ({
        value: o.value,
        content: o.content,
      })),
      currentAnswer: answer?.optionValue,
    };
  }

  async submitFormAnswer(
    formId: string,
    questionId: string,
    optionValue: string,
  ): Promise<AnswerResponseDto> {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    const fq = await this.prisma.formQuestion.findUnique({
      where: { formId_questionId: { formId, questionId } },
    });

    if (!fq) {
      throw new NotFoundException(
        `Question ${questionId} not found in form ${formId}`,
      );
    }

    if (fq.answered) {
      throw new NotFoundException(`Question ${questionId} already answered`);
    }

    await this.prisma.answer.create({
      data: {
        form_id: formId,
        question_id: questionId,
        optionValue,
      },
    });

    await this.prisma.formQuestion.update({
      where: { id: fq.id },
      data: { answered: true },
    });

    const progress = await this.getProgress(formId);

    if (progress.remaining === 0) {
      await this.completeForm(formId);
      const result = await this.getDiscResult(formId);
      progress.status = 'completed';
      return { progress, result };
    }

    return { progress };
  }

  async updateFormAnswer(
    formId: string,
    questionId: string,
    optionValue: string,
  ): Promise<AnswerResponseDto> {
    const existing = await this.prisma.answer.findUnique({
      where: {
        form_id_question_id: { form_id: formId, question_id: questionId },
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Answer for question ${questionId} not found`,
      );
    }

    await this.prisma.answer.update({
      where: { id: existing.id },
      data: { optionValue, updated_at: new Date() },
    });

    const progress = await this.getProgress(formId);
    return { progress };
  }

  async getDiscResult(formId: string): Promise<DiscResultDto> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        answers: {
          include: {
            Option: true,
            Question: true,
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    const scores: DiscScoresDto = { D: 0, I: 0, S: 0, C: 0 };
    const answers: AnswerDetailDto[] = [];

    for (const answer of form.answers) {
      const dimension = answer.Option.dimension as 'D' | 'I' | 'S' | 'C';
      scores[dimension]++;
      answers.push({
        questionId: answer.question_id,
        questionContent: answer.Question.content,
        optionValue: answer.optionValue,
        optionContent: answer.Option.content,
        dimension,
      });
    }

    const sorted = (['D', 'I', 'S', 'C'] as ('D' | 'I' | 'S' | 'C')[]).sort(
      (a, b) => scores[b] - scores[a],
    );

    const primary = sorted[0];
    const secondary = scores[sorted[1]] > 0 ? sorted[1] : null;

    const gap = scores[primary] - (secondary ? scores[secondary] : 0);
    const profile = secondary && gap < 2 ? `${primary}${secondary}` : primary;

    return {
      scores,
      primary,
      secondary,
      profile,
      total: form.answers.length,
      answers,
    };
  }

  async deleteForm(formId: string, userId: string): Promise<void> {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }
    if (form.user_id !== userId) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    await this.prisma.answer.deleteMany({ where: { form_id: formId } });
    await this.prisma.formQuestion.deleteMany({ where: { formId } });
    await this.prisma.form.delete({ where: { id: formId } });
  }

  async cleanupOrphanedForms(): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orphans = await this.prisma.form.findMany({
      where: {
        user_id: null,
        created_at: { lt: cutoff },
      },
      select: { id: true },
    });

    if (orphans.length === 0) return 0;

    const ids = orphans.map((f) => f.id);

    await this.prisma.answer.deleteMany({ where: { form_id: { in: ids } } });
    await this.prisma.formQuestion.deleteMany({ where: { formId: { in: ids } } });
    await this.prisma.form.deleteMany({ where: { id: { in: ids } } });

    return ids.length;
  }

  private async getProgress(formId: string): Promise<AnswerProgressDto> {
    const total = await this.prisma.formQuestion.count({ where: { formId } });
    const answered = await this.prisma.formQuestion.count({
      where: { formId, answered: true },
    });
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { status: true },
    });

    return {
      totalQuestions: total,
      answered,
      remaining: total - answered,
      status: form?.status ?? 'in_progress',
    };
  }

  private async completeForm(formId: string): Promise<void> {
    await this.prisma.form.update({
      where: { id: formId },
      data: { status: 'completed', updated_at: new Date() },
    });
  }

  private shuffle(array: string[]): string[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
