export class CreateQuestionDto {
  Question: string;
  is_publish: boolean;
  vote_counter: number;
  Answers: AnswerDto[];
}

export class AnswerDto {
  text: string;
  isCurrect: boolean;
  votePortion: number;
}
