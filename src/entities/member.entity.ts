import { Entity, Column } from 'typeorm';

@Entity()
export class Member {
  @Column({ unique: true })
  email: string;

  @Column()
  is_voted: boolean;

  @Column({ nullable: true })
  token: string;
}
