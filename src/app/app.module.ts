import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../framework/prisma/prisma.module';
import { QuestionModule } from '../question/question.module';
import { AuthModule } from 'src/auth';
import { UserModule } from 'src/user';
import { AppController } from '.';
import { FormModule } from 'src/form/form.module';
import { AnswerModule } from 'src/answer/answer.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UserModule,
    FormModule,
    AnswerModule,
    QuestionModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
