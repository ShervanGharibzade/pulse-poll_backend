import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [
    AuthModule,
    QuestionModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 5050,
      username: 'root',
      password: 'shervangh19@@',
      database: 'plusepoll',
      entities: [User, Question, Answer],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
