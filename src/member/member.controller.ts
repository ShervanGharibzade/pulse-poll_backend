import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberVoting } from 'src/dto/member-voting';
import { QuestionService } from 'src/question/question.service';

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly questionService: QuestionService,
  ) {}

  @Post('signup')
  async signupMember(memberVoting: MemberVoting) {
    try {
      const token = await this.memberService.saveMember(memberVoting);
      return { token };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  @Post('voting/:qUid/:aId')
  async addVotedMember(
    @Headers('authorization') token: string,
    @Param('qUid') qUid: string,
    @Param('aId') aId: number,
    @Body() body: { email: string },
  ) {
    const authToken = token?.replace('Bearer ', '');

    if (!authToken) {
      throw new HttpException(
        'Authorization token is missing',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const member = await this.memberService.getMemberByEmail(body.email);
      member.is_voted = true;
      await this.memberService.saveMember(member);
      await this.questionService.updateVoteQuestion(qUid, aId);
      return { success: 200, message: 'voting successfully done' };
    } catch (error) {
      throw new HttpException(
        error.message || 'An error occurred during signout',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
