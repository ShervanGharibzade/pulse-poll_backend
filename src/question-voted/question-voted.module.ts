import { Module } from '@nestjs/common';
import { QuestionVotedController } from './question-voted.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { Answer } from 'src/entities/answer.entity';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { QuestionVotedService } from './question-voted.service';
import { QuestionVoted } from 'src/entities/questionVoted.entity';
import { UserModule } from 'src/user/user.module';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    UserModule,
    QuestionModule,
    TypeOrmModule.forFeature([Question, Answer, User, QuestionVoted]),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [QuestionVotedController],
  providers: [QuestionVotedService],
  exports: [QuestionVotedService],
})
export class QuestionVotedModule {}
