import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Member {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  email: string;

  @Column()
  is_voted: boolean;

  @Column({ nullable: true })
  token: string;

  @Column('simple-array', { nullable: true, default: [] })
  quesListVoted: string[];
}
