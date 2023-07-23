import { Module } from '@nestjs/common';
import { AppController } from './controllers/app/app.controller';
import { UserController } from './controllers/user/user.controller';
import { QuestionController } from './controllers/question/question.controller';
import { AnswerController } from './controllers/answer/answer.controller';
import { AppService } from './services/app/app.service';
import { UserService } from './services/user/user.service';
import { QuestionService } from './services/question/question.service';
import { AnswerService } from './services/answer/answer.service';

@Module({
  imports: [],
  controllers: [
    AppController,
    UserController,
    QuestionController,
    AnswerController,
  ],
  providers: [AppService, UserService, QuestionService, AnswerService],
})
export class AppModule {}
