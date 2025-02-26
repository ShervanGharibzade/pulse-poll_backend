import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuestionVoted {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question_id: number;

  @Column()
  user_id: number;

  @Column()
  voter_id: number;

  @Column()
  answer_id: number;
}
