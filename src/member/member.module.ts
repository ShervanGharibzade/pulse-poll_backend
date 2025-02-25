import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MemberController } from './member.controller';
import { Member } from 'src/entities/member.entity';
import { QuestionService } from 'src/question/question.service';
import { Question } from 'src/entities/question.entity';
import { User } from 'src/entities/user.entity';
import { Answer } from 'src/entities/answer.entity';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    QuestionModule,
    TypeOrmModule.forFeature([Member, Question, User, Answer]),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [MemberController],
  providers: [MemberService, QuestionService],
  exports: [MemberService],
})
export class MemberModule {}
