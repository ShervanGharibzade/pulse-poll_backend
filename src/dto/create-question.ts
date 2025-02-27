export class CreateQuestionDto {
  Question: string;
  is_publish: boolean;
  userId: number;
  Answers: AnswerDto[];
}

export class AnswerDto {
  text: string;
  total_vote: number;
  is_correct: boolean;
}
