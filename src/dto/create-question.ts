export class CreateQuestionDto {
  Question: string;
  is_publish: boolean;
  Answers: AnswerDto[];
}

export class AnswerDto {
  text: string;
  isCurrect: boolean;
  votePortion: number;
}
