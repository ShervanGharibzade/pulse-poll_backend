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
      host: '127.0.0.1',
      port: 5050,
      username: 'root',
      password: 'shervangh19@@',
      database: 'plusepoll_db',
      entities: [User, Question, Answer],
      connectTimeout: 10000,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
