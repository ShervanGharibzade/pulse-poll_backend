import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { QuestionVoted } from 'src/entities/questionVoted.entity';
import { QuestionModule } from 'src/question/question.module';
import { QuestionVotedModule } from 'src/question-voted/question-voted.module';

@Module({
  imports: [
    forwardRef(() => QuestionModule),
    forwardRef(() => QuestionVotedModule),
    TypeOrmModule.forFeature([User, Question, QuestionVoted]),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
