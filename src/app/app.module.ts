import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../framework/prisma/prisma.module';
import { QuestionModule } from '../question/question.module';
import { AuthModule } from 'src/auth';
import { UserModule } from 'src/user';
import { AppController } from '.';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    QuestionModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
