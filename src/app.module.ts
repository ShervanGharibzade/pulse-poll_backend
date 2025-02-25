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
import { MemberController } from './member/member.controller';
import { MemberModule } from './member/member.module';
import { Member } from './entities/member.entity';

@Module({
  imports: [
    AuthModule, // Assuming this is a separate module for authentication
    QuestionModule, // Ensure there are no circular dependencies here
    UserModule, // Module for handling user-related functionality
    MemberModule, // Handle member-related operations
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 5050, // Make sure this port is correct
      username: 'root',
      password: 'shervangh19@@', // Ensure this is secure, avoid hardcoding secrets
      database: 'plusepoll_db',
      entities: [User, Question, Answer, Member],
      connectTimeout: 10000,
      synchronize: true, // Be cautious with this in production, as it auto-syncs the database schema
    }),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345', // Ensure the secret is appropriately secure
      signOptions: { expiresIn: '365d' },
    }),
  ],
  controllers: [AppController, UserController, MemberController], // Add controllers for handling routes
  providers: [AppService], // Services to handle business logic
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
