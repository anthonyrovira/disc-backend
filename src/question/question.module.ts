import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from 'src/question/question.controller';

@Module({
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}
