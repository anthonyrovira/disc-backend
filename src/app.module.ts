import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { QuestionController } from './controllers/question.controller';
import { AnswerController } from './controllers/answer.controller';
import { UserService } from './services/user.service';
import { QuestionService } from './services/question.service';
import { AnswerService } from './services/answer.service';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';

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
