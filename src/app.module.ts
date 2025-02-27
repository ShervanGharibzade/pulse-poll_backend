import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { QuestionModule } from './question/question.module';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { QuestionVotedModule } from './question-voted/question-voted.module';
import { QuestionVoted } from './entities/questionVoted.entity';

@Module({
  imports: [
    AuthModule,
    QuestionModule,
    UserModule,
    QuestionVotedModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 5050,
      username: 'root',
      password: 'shervangh19@@',
      database: 'plusepoll_db',
      entities: [User, Question, Answer, QuestionVoted],
      connectTimeout: 10000,
      synchronize: true,
    }),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService],
})
export class AppModule {}

// docker help
// docker run -d \
//   --name plusepoll \
//   -v /path/to/custom/my.cnf:/etc/mysql/my.cnf \
//   -e MYSQL_ROOT_PASSWORD=shervangh19@@ \
//   -e MYSQL_DATABASE=plusepoll_db \
//   -p 5050:3306 \
//   mysql:latest
