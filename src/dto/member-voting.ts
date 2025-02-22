import { IsNotEmpty, IsString } from 'class-validator';
import { IsUnique } from 'src/custom-validator/custom_validator';
import { Column } from 'typeorm';

export class MemberVoting {
  @IsString()
  @IsNotEmpty()
  @IsUnique({
    tableName: 'member',
    column: 'email',
  })
  email: string;

  @Column()
  is_voted: boolean;
}
