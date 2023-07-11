import { Injectable } from '@nestjs/common';
import { Answer } from '../models/data/answer.model';

@Injectable()
export class AnswerService {
  private answers: Answer[] = [];

  submitAnswer(answerData: Answer): Answer {
    const newAnswer = new Answer(
      answerData.userId,
      answerData.questionId,
      answerData.selectedOption,
    );
    this.answers.push(newAnswer);
    return newAnswer;
  }
}
