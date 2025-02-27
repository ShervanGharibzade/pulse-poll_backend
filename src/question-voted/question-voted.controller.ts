import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { QuestionVotedService } from './question-voted.service';
import { QuestionVotedDto } from 'src/dto/question-voted';
import { JwtService } from '@nestjs/jwt';
import { QuestionService } from 'src/question/question.service';

@Controller('question/voted')
export class QuestionVotedController {
  constructor(
    private readonly questionVotedService: QuestionVotedService,
    private readonly questionService: QuestionService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('/:qId')
  async submitVote(
    @Param('qId') qId: string,
    @Headers('authorization') authHeader: string,
    @Body() body: { aId: string; userId: number },
  ) {
    try {
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new HttpException(
          'Missing authorization token',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const decodeToken = this.jwtService.decode(token) as {
        username: string;
        id: string | number;
      };
      const voterId = Number(decodeToken?.id);
      const questionId = Number(qId);
      const answerId = Number(body.aId);
      const userId = Number(body.userId);

      console.log({ voterId, questionId, answerId, userId, decodeToken });
      const isUserVoted = await this.questionVotedService.hasUserVoted(voterId);

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
      console.error('Vote submission error:', error);
      throw new HttpException(
        `Error submitting vote: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
