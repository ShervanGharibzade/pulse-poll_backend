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

@Controller('question/voted')
export class QuestionVotedController {
  constructor(
    private readonly questionVotedService: QuestionVotedService,
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

      const decodeToken = this.jwtService.decode(token) as {
        username: string;
        userId: string;
      };

      const voterId = Number(decodeToken.userId);

      if (voterId === Number(body.userId)) {
        throw new HttpException(
          'Question owner cannot vote on their own question',
          HttpStatus.FORBIDDEN,
        );
      }

      const questionVoted: QuestionVotedDto = {
        question_id: Number(qId),
        user_id: Number(body.userId),
        voter_id: voterId,
        answer_id: Number(body.aId),
      };

      await this.questionVotedService.saveQuestionVote(questionVoted);

      return { message: 'Vote successfully submitted' };
    } catch (error) {
      throw new HttpException(
        `Error submitting vote: ${error.message || 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
