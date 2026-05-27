import { Injectable, NotFoundException } from '@nestjs/common';
import { Form } from '@prisma/client';
import { PrismaService } from '@/framework/prisma/prisma.service';

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
    return this.prisma.form.create({
      data: {
        name,
        user_id: userId,
        created_at: new Date(),
      },
    });
  }
}
