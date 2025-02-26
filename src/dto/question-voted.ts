import { IsNumber } from 'class-validator';
export class QuestionVotedDto {
  @IsNumber()
  question_id: number;
  @IsNumber()
  user_id: number;
  @IsNumber()
  voter_id: number;
  @IsNumber()
  answer_id: number;
}
