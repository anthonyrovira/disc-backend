import { Injectable } from '@nestjs/common';
import { Form } from '@prisma/client';
import { InitFormDto } from 'src/core/dtos';
import { PrismaService } from 'src/framework/prisma/prisma.service';

@Injectable()
export class FormService {
  constructor(private prisma: PrismaService) {}

  async initForm({ name, userId }: InitFormDto): Promise<Form> {
    try {
      return await this.prisma.form.create({
        data: {
          name: name,
          user_id: userId,
          created_at: new Date(),
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
