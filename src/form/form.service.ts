import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  AnswerProgressDto,
  AnswerResponseDto,
  FormQuestionResponseDto,
  NextQuestionDataDto,
} from './dto/form.dto';
import {
  DiscResultDto,
  DiscScoresDto,
  AnswerDetailDto,
  CategoryScoreDto,
} from './dto/disc-result.dto';
import { buildProfileData, buildSynergies } from './data/profile-builder';
import type { DiscDim } from './data/disc-profile-data';
import { Form } from '../../generated/prisma/client';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async getForms(userId: string): Promise<Form[]> {
    return this.prisma.form.findMany({
      where: { member: { userId } },
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

  private async createForm(name: string, userId: string): Promise<Form> {
    const member = await this.prisma.organizationMember.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!member) {
      throw new NotFoundException(
        'You must be a member of an organization to create a form',
      );
    }

    const allQuestions = await this.prisma.question.findMany({
      select: { id: true },
    });

    const shuffled = this.shuffle(allQuestions.map((q) => q.id)).slice(0, 30);

    const formName =
      name === 'disc_form'
        ? this.generateFormName()
        : name;

    return this.prisma.form.create({
      data: {
        name: formName,
        memberId: member.id,
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

  private generateFormName(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `Test DISC - ${day}/${month}/${year}`;
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
    const categoryMap = new Map<string, DiscScoresDto>();

    for (const answer of form.answers) {
      const dimension = answer.Option.dimension as DiscDim;
      const cat = answer.Question.category ?? 'Autre';
      scores[dimension]++;

      if (!categoryMap.has(cat)) {
        categoryMap.set(cat, { D: 0, I: 0, S: 0, C: 0 });
      }
      categoryMap.get(cat)![dimension]++;

      answers.push({
        questionId: answer.question_id,
        questionContent: answer.Question.content,
        category: answer.Question.category ?? undefined,
        optionValue: answer.optionValue,
        optionContent: answer.Option.content,
        dimension,
      });
    }

    const sorted = (['D', 'I', 'S', 'C'] as DiscDim[]).sort(
      (a, b) => scores[b] - scores[a],
    );

    const primary = sorted[0];
    const secondary = scores[sorted[1]] > 0 ? sorted[1] : null;

    const gap = scores[primary] - (secondary ? scores[secondary] : 0);

    const categoryScores: CategoryScoreDto[] = [];
    for (const [category, catScores] of categoryMap) {
      const dims = Object.entries(catScores) as [string, number][];
      dims.sort((a, b) => b[1] - a[1]);
      const total = dims.reduce((s, [, v]) => s + v, 0);
      categoryScores.push({
        category,
        scores: catScores,
        dominant: dims[0][1] > 0 ? (dims[0][0] as DiscDim) : 'D',
        total,
      });
    }

    return {
      name: form.name,
      scores,
      primary,
      secondary,
      profile: buildProfileData(primary, secondary, gap),
      synergies: buildSynergies(primary),
      total: form.answers.length,
      answers,
      categoryScores,
    };
  }

  async updateFormName(formId: string, userId: string, name: string): Promise<Form> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { member: { select: { userId: true } } },
    });
    if (!form || form.member?.userId !== userId) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }
    return this.prisma.form.update({
      where: { id: formId },
      data: { name, updated_at: new Date() },
    });
  }

  async deleteForm(formId: string, userId: string): Promise<void> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { member: { select: { userId: true } } },
    });
    if (!form || form.member?.userId !== userId) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    await this.prisma.answer.deleteMany({ where: { form_id: formId } });
    await this.prisma.formQuestion.deleteMany({ where: { formId } });
    await this.prisma.form.delete({ where: { id: formId } });
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
    const form = await this.prisma.form.update({
      where: { id: formId },
      data: { status: 'completed', updated_at: new Date() },
    });

    if (form.memberId) {
      await this.linkFormToOrganization(formId, form.memberId);
    }
  }

  private async linkFormToOrganization(
    formId: string,
    memberId: string,
  ): Promise<void> {
    const member = await this.prisma.organizationMember.findUnique({
      where: { id: memberId },
      select: { organizationId: true, userId: true },
    });

    if (!member) return;

    if (member.userId) {
      const allMemberships = await this.prisma.organizationMember.findMany({
        where: { userId: member.userId },
        select: { organizationId: true },
      });

      if (allMemberships.length === 0) return;

      await this.prisma.formOrganization.createMany({
        data: allMemberships.map((m) => ({
          formId,
          organizationId: m.organizationId,
        })),
        skipDuplicates: true,
      });
      return;
    }

    await this.prisma.formOrganization.create({
      data: { formId, organizationId: member.organizationId },
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
