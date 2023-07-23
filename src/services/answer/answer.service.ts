import { Injectable } from '@nestjs/common';
import { Answer } from '../dtos/data/answer.dto';

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

  getAllAnswers(): Answer[] {
    return this.answers;
  }

  getAnswerByQuestionId(questionId: string): Answer[] {
    return this.answers.filter((answer) => answer.questionId === questionId);
  }
}
