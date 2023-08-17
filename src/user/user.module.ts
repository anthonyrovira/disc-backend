import { Module } from '@nestjs/common';
import { UserController } from 'src/user/user.controller';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtGuard],
})
export class UserModule {}
