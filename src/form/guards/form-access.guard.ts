import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class FormAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const formId = request.params.id;

    const form = await this.prisma.form.findUnique({ where: { id: formId } });

    if (!form || (!form.user_id && !form.participantId)) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    request.form = form;
    return true;
  }
}
