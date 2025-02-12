import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from 'src/entities/user.entity';
import { Question } from 'src/entities/question.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Question]),
    JwtModule.register({
      secret: 'my-very-strong-secret-key-12345',
<<<<<<< Updated upstream
      signOptions: { expiresIn: '1h' },
=======
      signOptions: { expiresIn: '0' },
>>>>>>> Stashed changes
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
