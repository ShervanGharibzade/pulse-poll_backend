import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ default: 0 })
  vote_portion: number;

  @ManyToOne(() => Question, (question) => question.answers)
  question: Question;
}
