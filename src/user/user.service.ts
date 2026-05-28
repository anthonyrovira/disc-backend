import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/framework/prisma/prisma.service';
import type { Prisma, User } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUsers(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where,
      select: { id: true },
    });
    if (!user) throw new Error('User not found');

    const formIds = (
      await this.prisma.form.findMany({
        where: { user_id: user.id },
        select: { id: true },
      })
    ).map((f) => f.id);

    if (formIds.length > 0) {
      await this.prisma.answer.deleteMany({
        where: { form_id: { in: formIds } },
      });
      await this.prisma.formQuestion.deleteMany({
        where: { formId: { in: formIds } },
      });
      await this.prisma.form.deleteMany({
        where: { id: { in: formIds } },
      });
    }

    return this.prisma.user.delete({ where });
  }
}
