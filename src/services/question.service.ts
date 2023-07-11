import { Injectable, NotFoundException } from '@nestjs/common';
import { discData } from 'src/data/disc-data-fr';
import { Question } from 'src/models/data/question.model';

@Injectable()
export class QuestionService {
  private readonly questions: Question[] = discData;

  getAllQuestions(): Question[] {
    return this.questions;
  }

  getQuestionById(id: string): Question | undefined {
    const questionId = parseInt(id, 10);
    const question = this.questions.find(
      (question) => question.id === questionId,
    );
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return this.questions.find((question) => question.id === questionId);
  }

  // Autres méthodes du service
}
