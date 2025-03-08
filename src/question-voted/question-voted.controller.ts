import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { QuestionVotedService } from './question-voted.service';
import { QuestionVotedDto } from 'src/dto/question-voted';
import { JwtService } from '@nestjs/jwt';
import { QuestionService } from 'src/question/question.service';
import { AuthGuard } from 'src/auth/authGuard';

@Controller('question/voted')
export class QuestionVotedController {
  constructor(
    private readonly questionVotedService: QuestionVotedService,
    private readonly questionService: QuestionService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('/:qId')
  @UseGuards(AuthGuard)
  async submitVote(
    @Param('qId') qId: string,
    @Headers('authorization') authHeader: string,
    @Body() body: { aId: string; userId: number },
  ) {
    try {
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const decodeToken = (await this.jwtService.decode(token)) as {
        username: string;
        id: string | number;
      };
      const voterId = Number(decodeToken?.id);
      const questionId = Number(qId);
      const answerId = Number(body.aId);
      const userId = Number(body.userId);

      const isUserVoted = await this.questionVotedService.hasUserVoted(
        voterId,
        questionId,
      );

      if (isUserVoted) {
        throw new HttpException('user already voted', HttpStatus.BAD_REQUEST);
      }

      if (
        isNaN(voterId) ||
        isNaN(questionId) ||
        isNaN(answerId) ||
        isNaN(userId)
      ) {
        throw new HttpException(
          'Invalid input data: ID must be a valid number',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (voterId === userId) {
        throw new HttpException(
          'Question owner cannot vote on their own question',
          HttpStatus.FORBIDDEN,
        );
      }

      const questionVoted: QuestionVotedDto = {
        question_id: questionId,
        user_id: userId,
        voter_id: voterId,
        answer_id: answerId,
      };

      await this.questionVotedService.saveQuestionVote(questionVoted);
      await this.questionService.questionVoting(questionId, answerId);

      return { message: 'Vote successfully submitted' };
    } catch (error) {
      return { error };
    }
  }

  @Post('/details/:qId')
  @UseGuards(AuthGuard)
  async getQuestionDetails(
    @Headers('authorization') authHeader: string,
    @Param('qId') qId: string,
  ) {
    const qID = Number(qId);
    if (isNaN(qID)) {
      throw new Error('Invalid question ID');
    }
    const token = authHeader?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const usersAnswer = await this.questionVotedService.getVoters(qID);
    return usersAnswer;
  }
}
