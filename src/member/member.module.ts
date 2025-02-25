import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MemberController } from './member.controller';
import { Member } from 'src/entities/member.entity';
import { QuestionService } from 'src/question/question.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [MemberController],
  providers: [MemberService, QuestionService], // Inject QuestionService directly
  exports: [MemberService],
})
export class MemberModule {}
