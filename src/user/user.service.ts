import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  OrganizationRole,
  Prisma,
  User,
} from '../../generated/prisma/client';
import { UpdateProfileDto } from './dto/user.dto';

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

    const ownedOrgs = await this.prisma.organizationMembership.findMany({
      where: { userId: user.id, role: OrganizationRole.OWNER },
      select: { organization: { select: { name: true } } },
    });

    if (ownedOrgs.length > 0) {
      const orgNames = ownedOrgs.map((m) => m.organization.name).join(', ');
      throw new ForbiddenException(
        `You are the owner of: ${orgNames}. Transfer ownership before deleting your account.`,
      );
    }

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

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<User> {
    const data: Prisma.UserUpdateInput = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      data.lastName = dto.lastName;
    }
    if (dto.email !== undefined) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException({
          errors: [
            {
              field: 'email',
              message: 'Cet email est déjà utilisé par un autre compte',
            },
          ],
        });
      }
      data.email = dto.email;
    }
    if (dto.birthDate !== undefined) {
      data.birthDate = new Date(dto.birthDate);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
