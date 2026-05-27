import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from '@prisma/client';
import { PrismaService } from '@/framework/prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  getAllQuestions(): Promise<Question[]> {
    return this.prisma.question.findMany();
  }

  async getQuestionById(id: string) {
    const questionId = parseInt(id, 10);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }
}
