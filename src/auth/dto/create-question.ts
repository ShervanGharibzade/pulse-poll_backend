export class CreateQuestionDto {
  Question: string;
  Answers: AnswerDto[];
}

export class AnswerDto {
  text: string;
  isCurrect: boolean;
  votePortion: number;
}
