import {
  Controller,
  Get,
  Req,
  HttpException,
  HttpStatus,
  Post,
  Headers,
  Param,
  Body,
  Header,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { QuestionService } from 'src/question/question.service';
import { Question } from 'src/entities/question.entity';
import { QuestionVotedService } from 'src/question-voted/question-voted.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private questionVotedService: QuestionVotedService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/info')
  async getUserInfo(
    @Headers('authorization') authHeader: string,
  ): Promise<{ username: string; email: string }> {
    try {
      if (!authHeader) {
        throw new HttpException(
          'Authorization token is missing',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const token = authHeader.replace('Bearer ', '').trim();

      if (!token) {
        throw new HttpException(
          'Invalid authorization format',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const decoded = this.jwtService.decode(token) as {
        username: string;
        id: number;
      };
      console.log(decoded, 'de');

      if (!decoded || !decoded.username) {
        throw new HttpException(
          'Invalid token payload',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findByUsername(decoded.username);

      console.log(user, 'de');

      if (!user) {
        throw new HttpException(
          'User not found or token is invalid',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/vote/questions')
  async getQuestionsPublished(
    @Headers('authorization') authHeader: string,
  ): Promise<Question[]> {
    const username = await this.jwtService.decode(authHeader);
    const user = await this.userService.findByUsername(username);
    const questionsPublished =
      await this.questionService.getQuestionPublishedByUserId(user.id);
    return questionsPublished;
  }

  @Post('/vote/questions/:id/:aId')
  async voteQuestionsPublished(
    @Headers('authorization') authHeader: string,
    @Param('id') qId: string,
    @Body() body: { aId: string },
  ) {
    const username = await this.jwtService.decode(authHeader);
    const user = await this.userService.findByUsername(username);

    const question = await this.questionService.findQuestionById(Number(qId));

    if (!question) {
      throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
    }

    if (question.user.id === user.id) {
      throw new HttpException(
        'You are the creator and cannot vote on your own question',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const answer = question.answers.find((a) => a.id === Number(body.aId));

    if (!answer) {
      throw new HttpException('Answer not found', HttpStatus.NOT_FOUND);
    }

    const questionVoted = {
      question_id: question.id,
      user_id: question.user.id,
      voter_id: user.id,
      answer_id: Number(body.aId),
    };

    await this.questionVotedService.saveQuestionVote(questionVoted);

    return { message: 'Voting successfully done' };
  }
}
