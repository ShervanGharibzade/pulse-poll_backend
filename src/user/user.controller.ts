import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Headers,
  Param,
  Body,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
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
    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    try {
      const decoded = this.jwtService.decode(token) as {
        username: string;
        id: number;
      };

      if (!decoded || !decoded.username) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userService.findByUsername(decoded.username);

      if (!user) {
        throw new UnauthorizedException('User not found or token is invalid');
      }

      return {
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      console.error('Error in getUserInfo:', error);
      throw new BadRequestException(error.message || 'An error occurred');
    }
  }

  @Get('/vote/questions')
  async getQuestionsPublished(
    @Headers('authorization') authHeader: string,
  ): Promise<Question[]> {
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const decodeToken = (await this.jwtService.decode(token)) as {
      username: string;
      id: string;
    };

    const user = await this.userService.findByUsername(decodeToken.username);
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
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const decodeToken = (await this.jwtService.decode(token)) as {
      username: string;
      id: string;
    };
    const user = await this.userService.findByUsername(decodeToken.username);

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
