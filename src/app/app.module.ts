import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AuthModule } from '@/auth';
import { UserModule } from '@/user';
import { FormModule } from '@/form/form.module';
import { OrganizationsModule } from '@/organizations';
import { InvitationsModule } from '@/invitations';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
    AuthModule,
    UserModule,
    FormModule,
    OrganizationsModule,
    InvitationsModule,
    PrismaModule,
  ],
})
export class AppModule {}
