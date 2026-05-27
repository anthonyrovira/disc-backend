import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/framework/prisma/prisma.service';
import { Question } from '../../generated/prisma/client';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllQuestions(): Promise<Question[]> {
    return await this.prisma.question.findMany();
  }

  async getQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }
}
