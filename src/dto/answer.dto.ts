import { Question } from 'src/entities/question.entity';

export class AnswerDto {
  text: string;

  total_vote: number;

  is_correct: boolean;

  question: Question;
}
