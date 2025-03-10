import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Answer } from './answer.entity';
import { User } from './user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  uid: string;

  @Column()
  text: string;

  @Column({ default: false })
  is_publish: boolean;

  @OneToMany(() => Answer, (answer) => answer.question, { cascade: true })
  answers: Answer[];

  @ManyToOne(() => User, (user) => user.questions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @BeforeInsert()
  generateUid() {
    if (!this.uid) {
      this.uid = uuidv4();
    }
  }
}
