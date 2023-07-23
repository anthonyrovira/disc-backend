import { NotFoundException } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from 'src/dtos/data/question/question.dto';

describe('QuestionService', () => {
  let questionService: QuestionService;

  beforeEach(() => {
    questionService = new QuestionService();
  });

  describe('getAllQuestions', () => {
    it('should return an array of questions', () => {
      const questions: Question[] = questionService.getAllQuestions();
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBeTruthy();
    });
  });

  describe('getQuestionById', () => {
    it('should return the question with the specified ID', () => {
      const questionId = '1';
      const question: Question = questionService.getQuestionById(questionId);
      expect(question).toBeDefined();
      expect(question.id.toString()).toEqual(questionId);
    });

    it('should throw a NotFoundException if the question is not found', () => {
      const questionId = '999';
      expect(() => {
        questionService.getQuestionById(questionId);
      }).toThrowError(NotFoundException);
    });
  });
});
