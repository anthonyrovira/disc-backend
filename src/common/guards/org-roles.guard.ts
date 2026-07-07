import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationRole } from '../../../generated/prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

export const ORG_ROLES_KEY = 'org-roles';
export const OrgRoles = (...roles: OrganizationRole[]) =>
  SetMetadata(ORG_ROLES_KEY, roles);

@Injectable()
export class OrganizationRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<OrganizationRole[]>(
      ORG_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    let organizationId = request.params.id;

    if (!organizationId) {
      organizationId = request.body?.organizationId;
    }

    if (!organizationId) {
      throw new ForbiddenException('Organization ID not found');
    }

    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      select: { role: true },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    if (!roles.includes(member.role)) {
      throw new ForbiddenException(
        `Requires one of the following roles: ${roles.join(', ')}`,
      );
    }

    return true;
  }
}
