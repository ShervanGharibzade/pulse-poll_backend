import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberVoting } from 'src/dto/member-voting';
import { Question } from 'src/entities/question.entity';
import { Repository } from 'typeorm';

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly questionRepository: Repository<Question>,
  ) {}

  @Post('signup')
  async signupMember(@Body() memberVoting: MemberVoting) {
    try {
      const existingUser = await this.memberService.getMemberByEmail(
        memberVoting.email,
      );

      if (existingUser) {
        throw new HttpException(
          {
            message: 'Email is already registered',
            statusCode: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      const member = await this.memberService.saveMember(memberVoting);
      return { member };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Signup failed',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('get')
  async getMember(@Headers('authorization') token: string) {
    const authToken = token?.replace('Bearer ', '');

    try {
      const member = await this.memberService.getMemberByToken(authToken);

      if (!member) {
        throw new HttpException(
          {
            message: 'Member not found',
            statusCode: HttpStatus.NOT_FOUND, // Changed to NOT_FOUND
          },
          HttpStatus.NOT_FOUND, // Changed to NOT_FOUND
        );
      }

      return member;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'An error occurred while fetching member',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/voting')
  async addVotedMember(
    @Headers('authorization') token: string,
    @Body() body: { email: string; qUid: string; aId: number },
  ) {
    const logger = new Logger('VotingController');
    const { email, qUid, aId } = body;

    const authToken = token?.replace('Bearer ', '');
    if (!authToken) {
      logger.error('Authorization token is missing');
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const member = await this.memberService.getMemberByEmail(email);
      if (!member) {
        logger.warn(`Member with email ${email} not found`);
        throw new HttpException(
          `Member with email ${email} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (member.quesListVoted.includes(qUid)) {
        logger.warn(
          `Member with email ${email} has already voted for this question`,
        );
        throw new HttpException(
          'Member has already voted for this question',
          HttpStatus.CONFLICT,
        );
      }

      member.is_voted = true;
      member.quesListVoted.push(qUid);
      await this.memberService.updateIsVoted(member.email);

      // Log the actual SQL query being executed
      const query = this.questionRepository
        .createQueryBuilder()
        .update('answer')
        .set({ votePortion: member.is_voted ? 1 : 0 }) // Ensure votePortion is correctly set
        .where('id = :aId', { aId });

      logger.log(`Executing query: ${query.getQueryAndParameters()}`); // Log the query and parameters
      const updatedVote = await query.execute();

      if (!updatedVote) {
        logger.error(
          `Failed to update vote count for question ${qUid} and answer ${aId}`,
        );
        throw new HttpException(
          'Failed to update vote count',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      logger.log(
        `Voting successful for member ${email} on question ${qUid} and answer ${aId}`,
      );
      return { success: true, message: 'Voting successfully done' };
    } catch (error) {
      logger.error(error.message || 'An error occurred during voting');
      throw new HttpException(
        error.message || 'An error occurred during voting',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
