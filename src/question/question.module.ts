import { forwardRef, Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { QuestionVoted } from 'src/entities/questionVoted.entity';
import { QuestionVotedModule } from 'src/question-voted/question-voted.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Answer, User, QuestionVoted]),
    forwardRef(() => QuestionVotedModule),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
