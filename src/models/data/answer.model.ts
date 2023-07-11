// src/models/answer.model.ts

export class Answer {
  userId: string;
  questionId: string;
  selectedOption: string;

  constructor(userId: string, questionId: string, selectedOption: string) {
    this.userId = userId;
    this.questionId = questionId;
    this.selectedOption = selectedOption;
  }
}
